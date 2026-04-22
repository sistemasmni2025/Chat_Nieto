import json
from database import ejecutar_query_sql

def verify_fix():
    print("--- Verificando Fix de Decimal ---")
    # Buscamos algo con numeros (numeric) para forzar Decimals
    query = 'SELECT "almnom", "almprec" FROM "almcat" LIMIT 1'
    try:
        df = ejecutar_query_sql(query)
        data = df.to_dicts()
        print(f"Data: {data}")
        # Intentamos serializar a JSON (lo que hace FastAPI)
        json_data = json.dumps(data)
        print("Exito! JSON serializado correctamente.")
        print(f"JSON: {json_data}")
    except Exception as e:
        print(f"Falla: {e}")

if __name__ == "__main__":
    verify_fix()
