import cv2
import time
import platform
from ultralytics import YOLO

model = YOLO("yolov8n.pt")

es_raspberry = "arm" in platform.machine()

if es_raspberry:
    cam = cv2.VideoCapture(0, cv2.CAP_V4L2)
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
else:
    cam = cv2.VideoCapture(0)
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

if not cam.isOpened():
    print("❌ Error: No se pudo abrir la cámara")
    exit()

print("✅ Cámara inicializada correctamente")
time.sleep(2)

while True:
    ret, frame = cam.read()
    if not ret:
        print("❌ Error al capturar imagen")
        break

    results = model(frame, imgsz=320, classes=[0], verbose=False)
    r = results[0]

    annotated_frame = r.plot()

    frame_width = frame.shape[1]
    mitad = frame_width // 2

    izquierda = 0
    derecha = 0

    if r.boxes is not None:
        boxes = r.boxes.xyxy
        clases = r.boxes.cls

        for i, cls in enumerate(clases):
            class_name = r.names[int(cls)]

            if class_name == "person":
                x1, y1, x2, y2 = boxes[i]
                cx = float((x1 + x2) / 2)

                if cx < mitad:
                    izquierda += 1
                else:
                    derecha += 1

    if izquierda > derecha:
        print("Moviendo motores hacia la izquierda")
    elif derecha > izquierda:
        print("Moviendo motores hacia la derecha")
    elif izquierda > 0:
        print("Misma cantidad de objetivos en ambos lados")

    cv2.imshow("Detecciones", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cam.release()
cv2.destroyAllWindows()
