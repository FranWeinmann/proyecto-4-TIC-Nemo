from flask import Flask, request, jsonify, Response
import cv2
from ultralytics import YOLO
import RPi.GPIO as GPIO
import time

app = Flask(__name__)
model = YOLO("runs/segment/train/weights/best.pt")
camera = cv2.VideoCapture(0)
current_mode = "manual"
frenar = True

@app.route("/mode", methods=["POST"])
def change_mode():
    global current_mode
    data = request.get_json()
    current_mode = data.get("mode", "manual")
    print(f"Modo cambiado a: {current_mode}")
    return jsonify({"status": "ok", "mode": current_mode})


@app.route("/control", methods=["POST"])
def control():
    global frenar
    data = request.get_json()
    print("Datos joystick:", data)

    frenar = data.get("frenar", False)

    if frenar:
        detener()
        return jsonify({"status": "detenido"})

    direction = data.get("direction", 0)
    speed = data.get("speed", 0)
    velocidad = min(max(int(speed / 2), 20), 100)

    # codigo para determinar la direccion (hablar con nina)
    else:
        detener()

    return jsonify({"status": "ok"})


@app.route("/video")
def video_feed():
    def generate():
        while True:
            success, frame = camera.read()
            if not success:
                break

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

    return Response(generate(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')