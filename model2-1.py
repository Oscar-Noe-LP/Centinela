import cv2
import time
import mediapipe as mp
from mediapipe.python.solutions.drawing_utils import _normalized_to_pixel_coordinates
from math import dist, sqrt

pix = _normalized_to_pixel_coordinates

# Detectar el rostro con mediapipe
mp_face_mesh = mp.solutions.face_mesh
cara_detectada = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Variables para la aplicación
ojoizq = [362, 385, 387, 263, 373, 380]
ojoder = [33, 160, 158, 133, 153, 144]
VERDE = (0, 255, 0)
ROJO = (0, 0, 255)
LIMITE_EAR = 0.25  
TIEMPO_OJOS_CERRADOS = 1.3  
tiempo_inicio = time.perf_counter()
tiempo_sueño_acumulado = 0.0
alarma_activada = False
color_alerta = VERDE
vision_nocturna = False


# Iniciar cámara
camara = cv2.VideoCapture(0)

while camara.isOpened():
    # Leer frame de la cámara
    ret, frame = camara.read()
    if not ret:
        break
    
    if vision_nocturna:
        frame_gris = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        frame_mejorado = clahe.apply(frame_gris)
        frame_mejorado = cv2.GaussianBlur(frame_mejorado, (5, 5), 0)
        frame_nocturno = cv2.merge([frame_mejorado, frame_mejorado, frame_mejorado])
        frame = frame_nocturno
        
    # Convertir la imagen a RGB (MediaPipe lo requiere)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Procesar la imagen con MediaPipe
    resultados = cara_detectada.process(frame_rgb)

    if resultados.multi_face_landmarks:
        # Obtener los puntos de la cara detectada
        puntos_cara = resultados.multi_face_landmarks[0].landmark
        alto, ancho, _ = frame.shape

        # Obtener coordenadas de los ojos
        puntos_izq = []
        puntos_der = []

        for i in ojoizq:
            pci = puntos_cara[i]
            coordsi = pix(pci.x, pci.y, ancho, alto)
            puntos_izq.append(coordsi)

        for i in ojoder:
            pcd = puntos_cara[i]
            coordsd = pix(pcd.x, pcd.y, ancho, alto)
            puntos_der.append(coordsd)

        # Calcular EAR (Eye Aspect Ratio) para detectar si los ojos están cerrados
        try:
            P1_P5_I = dist(puntos_izq[1], puntos_izq[5])
            P2_P4_I = dist(puntos_izq[2], puntos_izq[4])
            P0_P3_I = dist(puntos_izq[0], puntos_izq[3])
            
            P1_P5_D = dist(puntos_der[1], puntos_der[5])
            P2_P4_D = dist(puntos_der[2], puntos_der[4])
            P0_P3_D = dist(puntos_der[0], puntos_der[3])
            
            # Cálculo del EAR
            EAR_izq = (P1_P5_I + P2_P4_I) / (2.0 * P0_P3_I)
            EAR_der = (P1_P5_D + P2_P4_D) / (2.0 * P0_P3_D)
            EAR_promedio = (EAR_izq + EAR_der) / 2.0
        except:
            EAR_promedio = 0.0  # Si hay un error, se pone en 0

        # Dibujar puntos en los ojos
        for punto in puntos_izq + puntos_der:
            cv2.circle(frame, punto, 2, color_alerta, -1)

        # Revisar si los ojos están cerrados
        if EAR_promedio < LIMITE_EAR:
            tiempo_actual = time.perf_counter()
            tiempo_sueño_acumulado += tiempo_actual - tiempo_inicio
            tiempo_inicio = tiempo_actual
            color_alerta = ROJO

            if tiempo_sueño_acumulado >= TIEMPO_OJOS_CERRADOS:
                alarma_activada = True
                cv2.putText(frame, "¡DESPIERTA!", (10, 250), cv2.FONT_HERSHEY_SIMPLEX, 1, ROJO, 2)
        else:
            tiempo_inicio = time.perf_counter()
            tiempo_sueño_acumulado = 0.0
            color_alerta = VERDE
            alarma_activada = False

        # Dibujar valores en pantalla
        cv2.putText(frame, f"EAR: {round(EAR_promedio, 2)}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color_alerta, 2)
        cv2.putText(frame, f"SUEÑO: {round(tiempo_sueño_acumulado, 2)} s", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color_alerta, 2)

    else:
        # Si no se detecta una cara, reiniciar valores
        tiempo_inicio = time.perf_counter()
        tiempo_sueño_acumulado = 0.0
        color_alerta = VERDE
        alarma_activada = False

    cv2.putText(frame, f"Vision Nocturna: {'ON' if vision_nocturna else 'OFF'}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, VERDE, 2)
    cv2.imshow("Detector de Fatiga", frame)

    # Presionar 'q' para salir
    tecla = cv2.waitKey(1) & 0xFF
    if tecla == ord('q'):  # Salir con 'q'
        break
    elif tecla == ord('n'):  # Activar/desactivar visión nocturna con 'n'
        vision_nocturna = not vision_nocturna

# Cerrar la cámara y liberar recursos
camara.release()
cv2.destroyAllWindows()
