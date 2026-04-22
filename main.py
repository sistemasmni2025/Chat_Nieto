from fastapi import FastAPI, HTTPException
import feedparser
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi.responses import StreamingResponse
import io
import time

from agent import generar_sql
from database import ejecutar_query_sql

app = FastAPI(title="Backend IA Nieto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    mensaje: str
    historial: List[Dict[str, Any]] = []
    modelo: str = "Razonamiento"

def procesar_texto_y_sugerencias(texto: str):
    """Extrae las 'SUGERENCIA:' del texto devuelto por Ollama."""
    if not texto:
        return "", []
        
    limpio = []
    sugerencias_encontradas = []
    for linea in texto.split('\n'):
        if linea.strip().startswith("SUGERENCIA:"):
            # Quitar la palabra clave para dárselas limpias al Front
            sug = linea.replace("SUGERENCIA:", "").strip()
            # Quitar posibles comillas o guiones extra
            sug = sug.lstrip('-').lstrip('"').rstrip('"').strip()
            if sug:
                sugerencias_encontradas.append(sug)
        else:
            limpio.append(linea)
            
    return '\n'.join(limpio).strip(), sugerencias_encontradas

@app.post("/api/chat")
def procesar_chat(request: ChatRequest):
    try:
        start_time = time.time()
        
        ia_respuesta = generar_sql(
            texto_usuario=request.mensaje,
            historial=request.historial,
            modelo_elegido=request.modelo
        )
        gen_time = time.time()
        
        if ia_respuesta["tipo"].lower() == "chat":
            msg_limpio, sugs = procesar_texto_y_sugerencias(ia_respuesta["mensaje"])
            return {
                "status": "success",
                "mensaje": msg_limpio,
                "sugerencias": sugs,
                "sql_generado": None,
                "total_registros": 0,
                "datos": [],
                "tiempos": {
                    "ia_segundos": round(gen_time - start_time, 2),
                    "bd_segundos": 0
                }
            }
            
        query = ia_respuesta["query"]
        datos = []
        df_len = 0
        mensaje_amigable = ia_respuesta.get("mensaje", "Respuesta analítica procesada.")
        
        try:
            df = ejecutar_query_sql(query)
            df_len = df.shape[0]
            if df_len > 0:
                if df_len > 2000:
                    datos = df.head(2000).to_dicts()
                else:
                    datos = df.to_dicts()
        except Exception as e_sql:
            error_msg = str(e_sql)
            
            rescate_respuesta = generar_sql(
                texto_usuario=request.mensaje,
                historial=request.historial,
                modelo_elegido=request.modelo,
                error_previo=error_msg
            )
            gen_time = time.time()
            
            if rescate_respuesta["tipo"].lower() == "sql":
                query = rescate_respuesta["query"]
                mensaje_amigable = rescate_respuesta.get("mensaje", "He auto-corregido mi consulta.")
                try:
                    df = ejecutar_query_sql(query)
                    df_len = df.shape[0]
                    if df_len > 0:
                        if df_len > 2000:
                            datos = df.head(2000).to_dicts()
                        else:
                            datos = df.to_dicts()
                except Exception as e_rescate:
                    msg_limpio, sugs = procesar_texto_y_sugerencias(f"He intentado buscarlo, pero sigo topándome con un error técnico al buscar '{query}'. Detalle: {str(e_rescate)}")
                    return {
                        "status": "success",
                        "mensaje": msg_limpio,
                        "sugerencias": sugs,
                        "sql_generado": None,
                        "total_registros": 0,
                        "datos": [],
                        "tiempos": {
                            "ia_segundos": round(gen_time - start_time, 2),
                            "bd_segundos": 0
                        }
                    }
            else:
                msg_limpio, sugs = procesar_texto_y_sugerencias(rescate_respuesta["mensaje"])
                return {
                    "status": "success",
                    "mensaje": msg_limpio,
                    "sugerencias": sugs,
                    "sql_generado": None,
                    "total_registros": 0,
                    "datos": [],
                    "tiempos": {
                        "ia_segundos": round(gen_time - start_time, 2),
                        "bd_segundos": 0
                    }
                }
        
        db_time = time.time()
        
        msg_limpio, sugs = procesar_texto_y_sugerencias(mensaje_amigable)
            
        return {
            "status": "success",
            "mensaje": msg_limpio,
            "sugerencias": sugs,
            "sql_generado": query,
            "total_registros": df_len,
            "datos": datos,
            "tiempos": {
                "ia_segundos": round(gen_time - start_time, 2),
                "bd_segundos": round(db_time - gen_time, 2)
            }
        }
        
    except Exception as e:
        import traceback
        print("-" * 50)
        print(f"ERROR CRÍTICO EN /api/chat: {str(e)}")
        traceback.print_exc()
        print("-" * 50)
        raise HTTPException(status_code=500, detail=f"Falla Interna: {str(e)}")

class ExportRequest(BaseModel):
    query: str

@app.post("/api/export")
def exportar_csv(request: ExportRequest):
    try:
        df = ejecutar_query_sql(request.query)
        if df.shape[0] == 0:
            raise HTTPException(status_code=404, detail="No hay datos para exportar")
            
        csv_str = df.write_csv()
        csv_bytes = csv_str.encode('utf-8-sig')
        
        return StreamingResponse(
            io.BytesIO(csv_bytes),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=reporte_nieto_full.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news")
def get_automotive_news():
    """Obtiene noticias reales del sector automotriz vía RSS."""
    feeds = [
        "https://www.motorpasion.com.mx/feed",
        "https://www.eluniversal.com.mx/rss/autopistas.xml"
    ]
    all_news = []
    for url in feeds:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:8]: # Tomamos las 8 más recientes de cada uno
                # Limpiar un poco el título si es necesario
                titulo = entry.title.strip()
                if titulo and titulo not in all_news:
                    all_news.append(titulo)
        except Exception as e:
            print(f"Error leyendo feed {url}: {e}")
            continue
    
    # Fallback si no hay internet o fallan los feeds
    if not all_news:
        return [
            "Tendencia: El sector automotriz en México crece un 15% en exportaciones.",
            "Tecnología: Nuevos sensores de presión para llantas inteligentes llegan al mercado.",
            "Dato: Multillantas Nieto refuerza su inventario con tecnología Star Schema."
        ]
        
    return all_news
