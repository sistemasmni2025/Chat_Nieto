import os
import psycopg2
import requests
from dotenv import load_dotenv

load_dotenv()

def test_db():
    print("--- Probando DB ---")
    try:
        conn = psycopg2.connect(
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            dbname=os.getenv("DB_NAME"),
            connect_timeout=3
        )
        print("[OK] DB conectada!")
        conn.close()
    except Exception as e:
        print(f"[FAIL] DB fallo: {e}")

def test_ollama():
    print("--- Probando Ollama ---")
    host = os.getenv("OLLAMA_HOST")
    try:
        resp = requests.get(host, timeout=3)
        print(f"[OK] Ollama accesible! Static: {resp.status_code}")
    except Exception as e:
        print(f"[FAIL] Ollama fallo: {e}")

if __name__ == "__main__":
    test_db()
    test_ollama()
