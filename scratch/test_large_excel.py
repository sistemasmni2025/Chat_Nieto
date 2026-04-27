import os
import sys
import pandas as pd

# Añadir el directorio actual al path para importar skills
sys.path.append(os.getcwd())

from skills import analizar_archivo_datos

# Configurar entorno
os.environ['DB_USER'] = 'ia_user'
os.environ['DB_PASSWORD'] = 'Mni#IA921016'
os.environ['DB_HOST'] = '172.16.71.208'
os.environ['DB_PORT'] = '5432'
os.environ['DB_NAME'] = 'ia_nieto'

ruta = r"c:\Users\SISTEMAS\Documents\Antigravity Projects\Chat_Nieto\uploads\INDICADORES COMERCIALIZACION2025 (Recuperado).xlsx"

print(f"Probando lectura de {ruta}...")
try:
    # Probar primero con la hoja BD
    resultado = analizar_archivo_datos(ruta, hoja="BD")
    print("RESULTADO BD:")
    print(resultado[:1000])
except Exception as e:
    import traceback
    print(f"ERROR LEYENDO BD: {str(e)}")
    traceback.print_exc()
