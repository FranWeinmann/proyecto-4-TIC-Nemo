import cv2
import time
import platform
from ultralytics import YOLO

# Cargar el modelo YOLO (nano = liviano, rápido para probar)
model = YOLO("yolov8n.pt")  # asegurate de tener descargado este modelo

# Detectar si corre en Raspberry Pi (ARM) o en PC
es_raspberry = "arm" in platform.machine()

if es_raspberry:
    cam = cv2.VideoCapture(0, cv2.CAP_V4L2)
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
else:
    cam = cv2.VideoCapture(0)
    cam.set(3, 640)
    cam.set(4, 480)

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

    # Pasar el frame al modelo
    results = model(frame, imgsz=320)  # imgsz=320 = más rápido, menos pesado

    # Dibujar resultados en el frame
    annotated_frame = results[0].plot()

    # Mostrar en ventana
    cv2.imshow("Detecciones", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cam.release()
cv2.destroyAllWindows()
