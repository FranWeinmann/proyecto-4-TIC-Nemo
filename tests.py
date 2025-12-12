from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import cv2
from ultralytics import YOLO
import RPi.GPIO as GPIO
import time
from picamera2 import Picamera2, Preview
import requests
import urllib3
import math
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
GPIO.cleanup

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {
	"origins": ["https://proyecto-nemo.vercel.app", "https://click-putting-investigation-shorter.trycloudflare.com"],
	"methods": ["GET", "POST", "OPTIONS"],
	"allow_headers": ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
}})
model = YOLO("best.pt")
picam = Picamera2()
picam.start()
current_mode = "manual"
frenar = True

@app.after_request
def add_cors_headers(response):
	response.headers.add("Access-Control-Allow-Origin", "https://proyecto-nemo.vercel.app")
	response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization,ngrok-skip-browser-warning")
	response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
	response.headers.add("Access-Control-Allow-Credentials", "true")
	return response



ENA = 12
IN1motorA = 16
IN2motorA = 18
ENB = 11
IN1motorB = 13
IN2motorB = 15
motorPins = [IN1motorA, IN2motorA, IN1motorB, IN2motorB]

IN1pasoD = 32
IN2pasoD = 36
IN3pasoD = 38
IN4pasoD = 40
pasoDerPins = [IN1pasoD, IN2pasoD, IN3pasoD, IN4pasoD]

IN1pasoI = 31
IN2pasoI = 33
IN3pasoI = 35
IN4pasoI = 37
pasoIzqPins = [IN1pasoI, IN2pasoI, IN3pasoI, IN4pasoI]

High = GPIO.HIGH
Low = GPIO.LOW

motorLista = [
	[High,Low,Low,High],
	[Low,High,High,Low],
	[Low,High,Low,High],
	[High,Low,High,Low],
	[Low,Low,Low,Low],
	[High,High,High,High]
]

pasosListaMAS = [
	[High,Low,Low,Low],
	[High,High,Low,Low],
	[Low,High,Low,Low],
	[Low,High,High,Low],
	[Low,Low,High,Low],
	[Low,Low,High,High],
	[Low,Low,Low,High],
	[High,Low,Low,High]
]
stepsCant = 750



GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)
for pin in range(4):
	GPIO.setup(motorPins[pin], GPIO.OUT)
	GPIO.setup(pasoDerPins[pin], GPIO.OUT)
	GPIO.setup(pasoIzqPins[pin], GPIO.OUT)
	GPIO.setup(ENA, GPIO.OUT)
	GPIO.setup(ENB, GPIO.OUT)

PWMA = GPIO.PWM(ENA, 1000)
PWMB = GPIO.PWM(ENB, 1000)

PWMA.start(50)
PWMB.start(50)



def cambiaVel():
	PWMA.ChangeDutyCycle(Speed)
	PWMB.ChangeDutyCycle(Speed)

def derecho():
	for entr in range (4):
		GPIO.output(motorPins[entr], motorLista[0][entr])

def atras():
	for entr in range (4):
		GPIO.output(motorPins[entr], motorLista[1][entr])

def giroDer(x):
	for entr in range (4):
		GPIO.output(motorPins[entr], motorLista[0][entr])
		PWMA.ChangeDutyCycle(Speed)
		PWMB.ChangeDutyCycle(math.floor(int(Speed)/x))

def giroIzq(x):
	for entr in range (4):
		GPIO.output(motorPins[entr], motorLista[0][entr])
		PWMA.ChangeDutyCycle(math.floor(int(Speed)/x))
		PWMB.ChangeDutyCycle(Speed)

def freno():
	for entr in range (4):
		GPIO.output(motorPins[entr], motorLista[4][entr])
		cambiaVel(0)



def abroRed():
	for i in range (stepsCant):
		izq = 7
		der = 0
		while izq > -1 and der < 8:
			for pin in range (4):
				GPIO.output(pasoDerPins[pin], pasosListaMAS[der][pin])
				GPIO.output(pasoIzqPins[pin], pasosListaMAS[izq][pin])
				der+= 1
				izq-= 1
			time.sleep(0.001)

def cierroRed():
	for i in range (stepsCant):
		izq = 0
		der = 7
		while izq < 8 and der > -1:
			for pin in range (4):
				GPIO.output(pasoDerPins[pin], pasosListaMAS[der][pin])
				GPIO.output(pasoIzqPins[pin], pasosListaMAS[izq][pin])
				der-= 1
				izq+= 1
			time.sleep(0.001)



def apago():
	for i in range(4):
		GPIO.output(pasoDerPins[i], Low)
		GPIO.output(pasoIzqPins[i], Low)
		GPIO.output(motorPins[i], Low)
	GPIO.output(ENA, Low)
	GPIO.output(ENB, Low)
	GPIO.cleanup()

def turnAllOff():
	picam.stop()
	picam.stop_preview()
	apago()
	func = request.environ.get('werkzeug.server.shutdown')
	if func:
		func()



def generate():
	while True:
		frame = picam.capture_array()
		if frame is None:
			continue
		if current_mode == "auto":
			results = model(frame, imgsz=320, verbose=False)
			frame_width = frame.shape[1]
			mitad = frame_width // 2
			izquierda = 0
			derecha = 0

			for r in results:
				boxes = r.boxes.xyxy
				clases = r.boxes.cls
				for i, cls in enumerate(clases):
					class_name = r.names[int(cls)]
					if class_name == "balls":
						x1, y1, x2, y2 = boxes[i]
						cx = (x1 + x2) / 2
						if cx < mitad:
							izquierda += 1
						else:
							derecha += 1

			if izquierda > derecha:
				pass
			elif derecha > izquierda:
				pass
			elif izquierda >= 1 and derecha == izquierda:
				pass
			else:
				pass

			frame = results[0].plot() if len(results) > 0 else frame

		_, buffer = cv2.imencode('.jpg', frame)
		yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' +
			   buffer.tobytes() + b'\r\n')


@app.route("/mode", methods=["POST"])
def change_mode():
	global current_mode	
	data = request.get_json()
	current_mode = data.get("mode", "manual")
	print(f"Modo cambiado a: {current_mode}")
	return jsonify({"status": "ok", "mode": current_mode})


@app.route("/isOn", methods=["POST"])
def turnOff():
	data = request.get_json()
	if not data["isOn"]:
		turnAllOff()
	return jsonify({"status": "ok"})


@app.route("/control", methods=["POST"])
def control():
	global frenar, Speed, PWMa, PWMb

	data = request.get_json()
	print("Datos joystick:", data)

	frenar = data.get("frenar", True)
	direction = data.get("direction", 0)
	speed = data.get("speed", 0)

	Speed = speed
	cambiaVel()

	if frenar:
		freno()
		cierroRed()
		return jsonify({"status": "detenido"})
	else:
		abroRed()

	if 105 < direction < 270:
		if direction <= 135:
			giroIzq(1.75)
		elif direction <= 165:
			giroIzq(2)
		elif direction <= 195:
			giroIzq(2.5)
		elif direction <= 225:
			giroIzq(3.25)
		elif direction <= 255:
			giroIzq(4.25)
		elif direction < 270:
			giroIzq(5.5)

	elif direction > 270 or direction < 75:
		if 270 > direction >= 45:
			giroDer(1.75)
		elif 270 > direction >= 15:
			giroDer(2)
		elif direction <= 345 or direction < 15:
			giroDer(2.5)
		elif direction >= 315:
			giroDer(3.25)
		elif direction >= 285:
			giroDer(4.25)
		elif direction > 270:
			giroDer(5.5)

	return jsonify({"status": "avanzando"})

@app.route("/video")
def video_feed():
	return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/verify", methods=["GET"])
def verify():
	return jsonify({"status": "alive"})

if __name__ == "__main__":
	try:
		app.run(host="0.0.0.0", port=5000, debug=False, ssl_context='adhoc')
	except KeyboardInterrupt:
		print("Cerrando servidor y cámara...")
		turnAllOff()
