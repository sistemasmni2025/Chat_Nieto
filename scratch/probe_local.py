import requests
import json

def probe():
    url = "http://172.16.71.200:8000/api/chat"
    payload = {
        "mensaje": "muestrame las sucursales",
        "historial": [],
        "modelo": "Razonamiento"
    }
    try:
        print(f"Probando consulta real en LOCAL {url}...")
        resp = requests.post(url, json=payload, timeout=30)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:500]}")
    except Exception as e:
        print(f"Fallo LOCAL: {e}")

if __name__ == "__main__":
    probe()
