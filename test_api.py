import requests
import json

def test_chat():
    url = "http://localhost:8000/api/chat"
    payload = {
        "mensaje": "muestrame 5 productos en stock",
        "historial": [],
        "modelo": "Razonamiento"
    }
    
    try:
        print(f"Enviando peticion a {url}...")
        resp = requests.post(url, json=payload, timeout=180)
        print(f"Status Code: {resp.status_code}")
        if resp.status_code != 200:
            print(f"Error: {resp.text}")
        else:
            print("Exito!")
            print(json.dumps(resp.json(), indent=2))
    except Exception as e:
        print(f"Fallo la peticion: {e}")

if __name__ == "__main__":
    test_chat()
