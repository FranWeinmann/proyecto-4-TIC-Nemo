import cv2
import time
import platform
from ultralytics import YOLO

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

    annotated_frame = results[0].plot() if len(results) > 0 else frame
    cv2.line(annotated_frame, (mitad, 0), (mitad, frame.shape[0]), (0, 255, 0), 2)
    cv2.putText(annotated_frame, f"Izquierda: {izquierda}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    cv2.putText(annotated_frame, f"Derecha: {derecha}", (mitad + 10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    if izquierda > derecha:
        # funcion para la izquierda (en diagonal, no giro)
    elif derecha > izquierda:
        # funcion para la derecha (en diagonal, no giro)
    elif (derecha >= 1 and izquierda >= 1):
        # elegir alguno de los lados e ir hacia las que detecte allí
    else:
        # dar vueltas hasta encontrar más¿

    cv2.imshow("Detecciones", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cam.release()
cv2.destroyAllWindows()
