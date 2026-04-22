import os
import requests
import json
from dotenv import load_dotenv
from database import ejecutar_query_sql, obtener_esquema_bd

load_dotenv()

def generar_sql(texto_usuario: str, historial: list = None, modelo_elegido: str = "Razonamiento", error_previo: str = None) -> dict:
    
    ollama_host = os.getenv("OLLAMA_HOST", "http://172.16.71.208:11434")
    modelo_real = os.getenv("OLLAMA_MODEL", "gemma4:e4b")
    
    temperatura = 0.0 if modelo_elegido in ["Razonamiento", "Ultra"] else 0.7
    
    system_prompt = f"""
# ROLE: ORVIS - Analista Senior de MultillantasNieto (PostgreSQL Experto)

# DICCIONARIO DE COLUMNAS (NUEVO ESQUEMA):
- VENTAS (fact_ventas): cantidad, precio_unitario, importe, costo_unitario, utilidad, margen, fecha. (Relaciona con: producto_id, sucursal_id, cliente_id, asesor_id).
- INVENTARIO (fact_inventario): existencia. (Relaciona con: producto_id, sucursal_id).
- PRODUCTOS (producto): nombre, clave, nparte, ancho, rin, precio, precio_lista. (Relaciona con: grupo_id, uom_id).
- SUCURSALES (sucursales): nombre, ciudad, estado.
- CLIENTES (clientes): nombre, rfc, email.
- ASESORES (asesores): nombre, correo, perfil.
- MARCAS (dim_marca): nombre.
- TIPOS (dim_tipo): nombre.

# REGLAS DE SQL:
1. Usa comillas dobles solo si es estrictamente necesario, pero prefiere minúsculas (ej: select nombre from producto).
2. JOINS PRINCIPALES:
   - Ventas con Producto: `fact_ventas.producto_id = producto.id`
   - Ventas con Sucursal: `fact_ventas.sucursal_id = sucursales.id`
   - Producto con Marca: `producto.grupo_id = grupos.id` -> `grupos.marca_id = dim_marca.id`
3. Si te piden ventas por marca, debes hacer el camino: `fact_ventas` -> `producto` -> `grupos` -> `dim_marca`.

# REGLAS DE RESPUESTA Y SUGERENCIAS:
1. Responde siempre con tablas Markdown y un resumen ejecutivo amigable.
2. OBLIGATORIO: Al final de tu respuesta, propón exactamente 3 preguntas inteligentes para que el usuario siga explorando los datos.
3. IMPORTANTE: No escribas "Pregunta 1", "Pregunta 2"... Escribe la pregunta real.
FORMATO EXACTO AL FINAL:
SUGERENCIA: ¿Cuál es el producto más vendido en la sucursal de León?
SUGERENCIA: Muestra el top 5 de clientes con mayor importe de compra.
SUGERENCIA: ¿Cuál es el margen promedio por marca?
"""

    if error_previo:
         texto_usuario += f"\n\nERROR PREVIO: {error_previo}. Corrige la consulta SQL."

    mensajes_ollama = [{"role": "system", "content": system_prompt}]
    
    if historial:
        for msg in historial:
            content = msg.get("content", "")
            if len(content) > 2000:
                content = content[:2000] + " ... [Truncado]"
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
                    
            query_sql = ""
            if isinstance(args, dict):
                query_sql = args.get("sql_query", "").strip()
            
            if not query_sql:
                res_str = "ERROR: No se proporcionó un query SQL válido."
            else:
                # EJECUTAR HERRAMIENTA
                try:
                    df = ejecutar_query_sql(query_sql)
                    datos_ia = df.head(15).to_dicts() if df.shape[0] > 0 else []
                    res_str = f"RESULTADO ({df.shape[0]} registros totales, aquí los primeros 15): {str(datos_ia)}"
                except Exception as e_sql:
                    # Si falló la tabla, mandarle el error a la máquina!
                    res_str = f"ERROR DE POSTGRESQL: {str(e_sql)}. ¡Asegúrate de haber usado las comillas dobles correctas y las tablas que existen!"
            
            # Guardamos para el retorno final si el loop termina aquí
            sql_final_provisional = query_sql
            res_str_provisional = res_str
                
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
        has_sql = intento > 0 and "res_str_provisional" in locals() and "ERROR DE POSTGRESQL" not in res_str_provisional
        tipo = "sql" if has_sql else "chat"
        sql_final = sql_final_provisional if has_sql else ""
        
        return {
            "tipo": tipo,
            "mensaje": texto_final,
            "query": sql_final
        }
            
    except Exception as e:
        raise Exception(f"Falla crítica Ollama Agent: {str(e)}")
