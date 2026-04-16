import os
import requests
import json
from dotenv import load_dotenv
from database import ejecutar_query_sql, obtener_esquema_bd

load_dotenv()

def generar_sql(texto_usuario: str, historial: list = None, modelo_elegido: str = "Razonamiento", error_previo: str = None) -> dict:
    
    ollama_host = os.getenv("OLLAMA_HOST", "http://172.16.71.173:11434")
    modelo_real = os.getenv("OLLAMA_MODEL", "gemma4:e2b")
    
    temperatura = 0.0 if modelo_elegido in ["Razonamiento", "Ultra"] else 0.7
    
    system_prompt = f"""
# ROLE: Analista Senior de MultillantasNieto (PostgreSQL Experto)

# DICCIONARIO DE COLUMNAS (CRÍTICO):
- PRODUCTOS (almcat): Nombre="almnom", Clave="almcve", Precio="almprec", Rin="almrin".
- STOCK (sucursalarticulo): Cantidad="almstock", Clave="almcve".
- ÓRDENES (ordenservicio): Folio="ordenServicioFolio", Fecha="ordenServicioFecha", Placa="ordenServicioVehPlaca".
- VENTAS DETALLE (ventadetalle): Cantidad="VentaDetalleCan", ID="VentaId".
- VENTAS CABECERA (venta): Fecha="VentaFecha", ID="VentaId".

# REGLAS DE SQL:
1. Siempre usa comillas dobles para tablas y columnas: "ordenServicioFecha", "almcat".
2. Para reportes de ventas por fecha, haz JOIN entre "ventadetalle" y "venta" usando "VentaId".
3. Si no estás seguro de una columna, consulta primero "information_schema.columns".

# FORMATO DE RESPUESTA FINAL:
Responde siempre con tablas Markdown y un resumen ejecutivo amigable. Tu objetivo es explicar los datos que obtuviste.
OBLIGATORIO: Al final de tu resumen, proporciona exactamente 3 preguntas sugeridas que el usuario te podría hacer a continuación para indagar más. Usa este formato exacto:
SUGERENCIA: Pregunta 1
SUGERENCIA: Pregunta 2
SUGERENCIA: Pregunta 3
"""

    if error_previo:
         texto_usuario += f"\n\nERROR PREVIO: {error_previo}. Corrige la consulta SQL."

    mensajes_ollama = [{"role": "system", "content": system_prompt}]
    
    if historial:
        for msg in historial:
            content = msg.get("content", "")
            if len(content) > 1000:
                content = content[:1000] + " ... [Truncado]"
            mensajes_ollama.append({"role": msg.get("role", "user"), "content": content})
            
    mensajes_ollama.append({"role": "user", "content": texto_usuario})

    url = f"{ollama_host}/api/chat"
    
    payload = {
        "model": modelo_real,
        "messages": mensajes_ollama,
        "stream": False,
        "options": { "temperature": temperatura },
        "tools": [
            {
                "type": "function",
                "function": {
                    "name": "consultar_base_datos",
                    "description": "Filtra, busca y extrae información sobre Multillantas Nieto usando PostgreSQL",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "sql_query": {
                                "type": "string",
                                "description": "El query SQL puro, en postgresql usando comillas dobles."
                            }
                        },
                        "required": ["sql_query"]
                    }
                }
            }
        ]
    }
    
    try:
        resp = requests.post(url, json=payload, timeout=180)
        resp.raise_for_status()
        resultado = resp.json()
        message = resultado.get("message", {})
        
        # Inicia lógica de recursión simulada (OpenWebUI Loop)
        max_intentos = 2
        intento = 0
        
        while "tool_calls" in message and len(message["tool_calls"]) > 0 and intento < max_intentos:
            intento += 1
            tool = message["tool_calls"][0]
            args = tool.get("function", {}).get("arguments", {})
            
            if isinstance(args, str):
                try: args = json.loads(args)
                except: pass
                    
            query_sql = args.get("sql_query", "").strip()
            
            # EJECUTAR HERRAMIENTA
            try:
                df = ejecutar_query_sql(query_sql)
                datos_ia = df.head(15).to_dicts() if df.shape[0] > 0 else []
                res_str = f"RESULTADO ({df.shape[0]} registros totales, aquí los primeros 15): {str(datos_ia)}"
            except Exception as e_sql:
                # Si falló la tabla, mandarle el error a la máquina!
                res_str = f"ERROR DE POSTGRESQL: {str(e_sql)}. ¡Asegúrate de haber usado las comillas dobles correctas y las tablas que existen!"
                
            # Agregamos la petición de herramienta y su resultado al contexto
            mensajes_ollama.append(message)
            mensajes_ollama.append({
                "role": "tool",
                "content": res_str,
                "name": "consultar_base_datos"
            })
            
            # Si hubo error, dejamos que la IA re-intente su herramienta,
            # Si no hubo error, la IA usará los datos para dar la respuesta final.
            payload_siguiente = {
                "model": modelo_real,
                "messages": mensajes_ollama,
                "stream": False,
                "options": { "temperature": 0.5 }
            }
            
            resp2 = requests.post(url, json=payload_siguiente, timeout=180)
            resultado2 = resp2.json()
            message = resultado2.get("message", {})
            
            # El "while" se repite si message tiene "tool_calls" de nuevo (si falló y re-intentó).
            # Si no, significa que la IA ya escribió la respuesta en Markdown de los datos finales!
            
        # Cuando escape del ciclo while (o porque ya es texto o por max_intentos):
        texto_final = message.get("content", "Procesado.").strip()
        
        # Determinamos si logró o no generar un SQL final
        tipo = "sql" if intento > 0 and "ERROR DE POSTGRESQL" not in res_str else "chat"
        # query_sql puede no existir si intento == 0
        sql_final = query_sql if "query_sql" in locals() and "ERROR DE POSTGRESQL" not in res_str else ""
        
        return {
            "tipo": tipo,
            "mensaje": texto_final,
            "query": sql_final
        }
            
    except Exception as e:
        raise Exception(f"Falla crítica Ollama Agent: {str(e)}")
