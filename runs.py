import subprocess
import time
import requests
import urllib3
import os

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ngrok_process = None
server_process = None

try:
    print("Iniciando Ngrok...")
    ngrok_process = subprocess.Popen([
        "ngrok",
        "http",
        "https://localhost:5000"
    ])
    time.sleep(3)

    print("Iniciando servidor Flask...")
    server_process = subprocess.Popen(["python3", "tests.py"])

    while True:
        try:
            resp = requests.get("https://localhost:5000/isOn", verify=False, timeout=1)
            if resp.get_json() != True:
                break
        except requests.exceptions.RequestException:
            break
        time.sleep(1)

finally:
    print("Cerrando servicios...")
    if server_process and server_process.poll() is None:
        server_process.terminate()
        print("Servidor detenido")
    if ngrok_process and ngrok_process.poll() is None:
        ngrok_process.terminate()
        print("Ngrok detenido")

    print("Apagando Raspberry Pi en 5 segundos...")
    time.sleep(5)
    os.system("sudo shutdown -h now")
