import polars as pl
import os
import PyPDF2
import docx

def analizar_archivo_datos(ruta_archivo: str, instruccion: str = "") -> str:
    """
    Lee un archivo local (Excel, CSV, Word, PDF, ODS, TXT) y extrae su contenido.
    """
    if not os.path.exists(ruta_archivo):
        return f"Error: No se encontró el archivo en la ruta {ruta_archivo}"
        
    ext = ruta_archivo.split('.')[-1].lower()
    
    try:
        if ext in ['csv', 'xlsx', 'xls', 'ods']:
            if ext == 'csv':
                df = pl.read_csv(ruta_archivo, ignore_errors=True)
            elif ext in ['xlsx', 'xls', 'ods']:
                df = pl.read_excel(ruta_archivo)
                
            # Si el archivo no tiene encabezados, la primera fila se vuelve columnas y confunde a la IA.
            # Para evitarlo, renombramos todas las columnas a nombres genéricos limpios.
            nuevas_columnas = [f"columna_{i}" for i in range(len(df.columns))]
            df.columns = nuevas_columnas
            
            filas = len(df)
            columnas = list(df.columns)
            
            # Subir a la BD de PostgreSQL temporalmente
            db_uri = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
            
            try:
                # pandas to_sql using sqlalchemy is more robust than polars if adbc is missing
                import sqlalchemy
                engine = sqlalchemy.create_engine(db_uri)
                df_pd = df.to_pandas()
                df_pd.to_sql("temp_archivo_usuario", engine, if_exists='replace', index=False)
                
                # Muestra de 3 filas para que la IA sepa qué hay en las columnas
                muestra = df_pd.head(3).to_markdown(index=False)
                
                resumen = f"=== DATOS DEL ARCHIVO {ext.upper()} ===\nTotal de filas: {filas}\nColumnas: {columnas}\n\nMuestra de 3 filas para entender el contenido:\n{muestra}\n\n[SISTEMA A IA: Archivo escaneado exitosamente. Para poder analizar las {filas} filas sin que te quedes sin memoria, he cargado este archivo en un Sandbox Temporal en memoria bajo el nombre de tabla `temp_archivo_usuario`. DEBES responder a la solicitud del usuario USANDO TU HERRAMIENTA `consultar_base_datos` para consultar la tabla `temp_archivo_usuario`. ADVERTENCIA CRÍTICA: Las columnas originales fueron renombradas a formato genérico (`columna_0`, `columna_1`, etc.). ESTÁ ESTRICTAMENTE PROHIBIDO inventar nombres de columnas como 'Marca' o 'Cantidad'. Debes deducir qué `columna_X` tiene la marca y cuál tiene las ventas mirando la 'Muestra de 3 filas' de arriba, y usar EXACTAMENTE esos nombres (`columna_X`) en tu código SQL. MUY IMPORTANTE: Si necesitas hacer operaciones matemáticas (SUM) o numéricas (<, >), DEBES usar la función `orbis_safe_numeric(columna_X)` en lugar de CAST. Ejemplo: `WHERE orbis_safe_numeric(columna_27) < 0` o `SUM(orbis_safe_numeric(columna_27))`. Esto evita que el motor colapse con textos mezclados en el archivo Excel.]\n"
                return resumen
            except Exception as e_bd:
                # Fallback to 15 rows if upload fails
                muestra = df.head(15).to_pandas().to_markdown(index=False)
                resumen = f"=== DATOS DEL ARCHIVO {ext.upper()} ===\nTotal de filas: {filas}\nColumnas: {columnas}\n\nError cargando a BD ({str(e_bd)}). Primeros 15 registros:\n{muestra}\n"
                return resumen
            
        elif ext == 'pdf':
            reader = PyPDF2.PdfReader(ruta_archivo)
            texto = ""
            for i in range(min(5, len(reader.pages))):
                texto += reader.pages[i].extract_text() + "\n"
            return f"=== CONTENIDO DEL PDF (Primeras 5 pags) ===\n\n{texto[:5000]}"
            
        elif ext in ['doc', 'docx']:
            doc = docx.Document(ruta_archivo)
            texto = "\n".join([para.text for para in doc.paragraphs])
            return f"=== CONTENIDO DEL WORD ===\n\n{texto[:5000]}"
            
        elif ext in ['txt', 'md', 'json', 'py', 'js', 'jsx', 'html', 'css']:
            with open(ruta_archivo, 'r', encoding='utf-8', errors='ignore') as f:
                texto = f.read()
            return f"=== CONTENIDO DEL ARCHIVO DE TEXTO ===\n\n{texto[:5000]}"
            
        else:
            return f"Error: Formato de archivo .{ext} no soportado."
            
    except Exception as e:
        return f"Error leyendo el archivo {ruta_archivo} ({ext}): {str(e)}"
