import cv2
import time
import platform
from ultralytics import YOLO

# Carga el modelo entrenado
model = YOLO("runs/segment/train/weights/best.pt")

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
    print("Error: No se pudo abrir la cámara")
    exit()

print("Cámara inicializada correctamente")
time.sleep(2)

while True:
    ret, frame = cam.read()
    if not ret:
        print("Error al capturar imagen")
        break

    results = model(frame, imgsz=320, verbose=False)

    # Filtrar solo detecciones de la clase "balls"
    filtered_results = []
    for r in results:
        mask_filtered = []
        for i, cls in enumerate(r.boxes.cls):  # iteramos sobre cada caja detectada
            class_name = r.names[int(cls)]
            if class_name == "balls":
                mask_filtered.append(i)
        if mask_filtered:
            filtered_results.append(r)

    if filtered_results:
        annotated_frame = filtered_results[0].plot()
    else:
        annotated_frame = frame  # si no hay detecciones, mostramos la imagen normal

    cv2.imshow("Detecciones", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cam.release()
cv2.destroyAllWindows()
