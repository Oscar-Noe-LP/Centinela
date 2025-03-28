import cv2
import os
import threading
import simpleaudio as sa
from model2 import VideoFrameHandler  # Asegúrate de que este archivo tiene el procesamiento adecuado

# Ruta del sonido de alarma
alarm_file_path = os.path.join("audio", "wake_up.wav")

# Configuración de umbrales
EAR_THRESH = 0.18  # Ajusta según necesidad
WAIT_TIME = 1.0    # Segundos antes de sonar la alarma

thresholds = {"EAR_THRESH": EAR_THRESH, "WAIT_TIME": WAIT_TIME}

# Cargar el modelo de detección de fatiga
video_handler = VideoFrameHandler()

# Para evitar conflictos entre hilos
lock = threading.Lock()
shared_state = {"play_alarm": False}

def play_audio():
    """Reproduce el sonido en un hilo separado."""
    wave_obj = sa.WaveObject.from_wave_file(alarm_file_path)
    play_obj = wave_obj.play()
    play_obj.wait_done()

# Inicializar la cámara
cap = cv2.VideoCapture(0)  # Usa la cámara predeterminada

if not cap.isOpened():
    print("Error: No se pudo abrir la cámara.")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: No se pudo capturar el cuadro de video.")
        break

    # Procesar el cuadro con el modelo
    frame, play_alarm = video_handler.process(frame, thresholds)

    with lock:
        shared_state["play_alarm"] = play_alarm

    # Si se detecta fatiga, reproducir el sonido
    if play_alarm:
        threading.Thread(target=play_audio, daemon=True).start()

    # Mostrar la imagen en una ventana
    cv2.imshow("Detección de Fatiga", frame)

    # Salir con la tecla 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Liberar recursos
cap.release()
cv2.destroyAllWindows()
