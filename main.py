from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from agent import generar_sql
from database import ejecutar_query_sql
import time

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
            if df.shape[0] > 0:
                datos = df.to_dicts()
            df_len = df.shape[0]
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
                df = ejecutar_query_sql(query)
                if df.shape[0] > 0:
                    datos = df.to_dicts()
                df_len = df.shape[0]
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
        print(f"Error Crítico: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
