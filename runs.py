import subprocess
import time
import requests
import urllib3
import os

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ngrok_process = None
server_process = None

def wait_for_server():
	print("Esperando a que Flask esté disponible...")
	print("Esperando a que Flask esté disponible...")
	for i in range(30):
		try:
			r = requests.get("https://localhost:5000/verify", verify=False, timeout=1)
			if 200 <= r.status_code <= 299:
				print("Servidor Flask listo")
				return True
		except:
			pass
		time.sleep(1)
	return False

def closeAll():
	time.sleep(5)
	print("Cerrando servicios...")
	if server_process and server_process.poll() is None:
		server_process.terminate()
		print("Servidor detenido")
	if ngrok_process and ngrok_process.poll() is None:
		ngrok_process.terminate()
		print("Ngrok detenido")

	print("Apagando Raspberry Pi en 5 segundos...")
	i=5
	while i > 0:
		print(i)
		time.sleep(1)
		i -= 1
	os.system("sudo shutdown -h now")

try:
	print("Iniciando servidor Flask...")
	server_process = subprocess.Popen(["python3", "tests.py"])
	
	if not wait_for_server():
		print("Flask no arrancó, abortando")
		exit(1)

	print("Iniciando Ngrok...")
	ngrok_process = subprocess.Popen([
		"ngrok",
		"http",
		"https://localhost:5000"
	])
	time.sleep(8)
	while True:
		try:
			data = requests.get("https://localhost:5000/isOn", verify=False, timeout=1)
			resp = data.json()
			if resp["isOn"]:
				pass
			else:
				closeAll()
		except Exception as e:
			print("Error:", e)
			traceback.print_exc()
		time.sleep(1)
except:
	print("sixseven") 
