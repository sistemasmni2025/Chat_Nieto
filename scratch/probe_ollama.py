import requests

def probe_ollama():
    url = "http://172.16.71.208:11434/api/generate"
    payload = {
        "model": "llama3.1:8b",
        "prompt": "hola",
        "stream": False
    }
    try:
        print(f"Probando Ollama en {url}...")
        resp = requests.post(url, json=payload, timeout=10)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:200]}")
    except Exception as e:
        print(f"Fallo Ollama: {e}")

if __name__ == "__main__":
    probe_ollama()
