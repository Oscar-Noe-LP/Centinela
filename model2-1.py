import cv2
import time
import mediapipe as mp

# Inicializar MediaPipe para detectar la cara
mp_face_mesh = mp.solutions.face_mesh
detector_cara = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Índices de los puntos clave en los ojos
puntos_ojo_izquierdo = [362, 385, 387, 263, 373, 380]
puntos_ojo_derecho = [33, 160, 158, 133, 153, 144]

# Colores para dibujar en pantalla
COLOR_VERDE = (0, 255, 0)
COLOR_ROJO = (0, 0, 255)

# Valores para detectar fatiga
UMBRAL_EAR = 0.25  # Si es menor, se considera que los ojos están cerrados
TIEMPO_MAX_CERRADOS = 2.0  # Segundos antes de activar la alerta

# Variables para controlar el estado del conductor
tiempo_inicio = time.perf_counter()
tiempo_sueño_acumulado = 0.0
alarma_activada = False
color_actual = COLOR_VERDE
vision_nocturna = False

# Iniciar cámara
camara = cv2.VideoCapture(0)

while camara.isOpened():
    # Leer frame de la cámara
    ret, frame = camara.read()
    if not ret:
        break
    
    if vision_nocturna:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced_gray = clahe.apply(gray)
        enhanced_gray = cv2.GaussianBlur(enhanced_gray, (5, 5), 0)
        enhanced_frame = cv2.merge([enhanced_gray, enhanced_gray, enhanced_gray])
        frame = enhanced_frame
        
    # Convertir la imagen a RGB (MediaPipe lo requiere)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Procesar la imagen con MediaPipe
    resultados = detector_cara.process(frame_rgb)

    if resultados.multi_face_landmarks:
        # Obtener los puntos de la cara detectada
        puntos_cara = resultados.multi_face_landmarks[0].landmark
        altura, ancho, _ = frame.shape

        # Obtener coordenadas de los ojos
        puntos_izq = []
        puntos_der = []

        for i in puntos_ojo_izquierdo:
            x = int(puntos_cara[i].x * ancho)
            y = int(puntos_cara[i].y * altura)
            puntos_izq.append((x, y))

        for i in puntos_ojo_derecho:
            x = int(puntos_cara[i].x * ancho)
            y = int(puntos_cara[i].y * altura)
            puntos_der.append((x, y))

        # Calcular EAR (Eye Aspect Ratio) para detectar si los ojos están cerrados
        try:
            # Distancias verticales
            d1_izq = ((puntos_izq[1][0] - puntos_izq[5][0])**2 + (puntos_izq[1][1] - puntos_izq[5][1])**2) ** 0.5
            d2_izq = ((puntos_izq[2][0] - puntos_izq[4][0])**2 + (puntos_izq[2][1] - puntos_izq[4][1])**2) ** 0.5
            d1_der = ((puntos_der[1][0] - puntos_der[5][0])**2 + (puntos_der[1][1] - puntos_der[5][1])**2) ** 0.5
            d2_der = ((puntos_der[2][0] - puntos_der[4][0])**2 + (puntos_der[2][1] - puntos_der[4][1])**2) ** 0.5

            # Distancias horizontales
            d3_izq = ((puntos_izq[0][0] - puntos_izq[3][0])**2 + (puntos_izq[0][1] - puntos_izq[3][1])**2) ** 0.5
            d3_der = ((puntos_der[0][0] - puntos_der[3][0])**2 + (puntos_der[0][1] - puntos_der[3][1])**2) ** 0.5

            # Cálculo del EAR
            EAR_izq = (d1_izq + d2_izq) / (2.0 * d3_izq)
            EAR_der = (d1_der + d2_der) / (2.0 * d3_der)
            EAR_promedio = (EAR_izq + EAR_der) / 2.0
        except:
            EAR_promedio = 0.0  # Si hay un error, se pone en 0

        # Dibujar puntos en los ojos
        for punto in puntos_izq + puntos_der:
            cv2.circle(frame, punto, 2, color_actual, -1)

        # Revisar si los ojos están cerrados
        if EAR_promedio < UMBRAL_EAR:
            tiempo_actual = time.perf_counter()
            tiempo_sueño_acumulado += tiempo_actual - tiempo_inicio
            tiempo_inicio = tiempo_actual
            color_actual = COLOR_ROJO

            if tiempo_sueño_acumulado >= TIEMPO_MAX_CERRADOS:
                alarma_activada = True
                cv2.putText(frame, "¡DESPIERTA!", (10, 250), cv2.FONT_HERSHEY_SIMPLEX, 1, COLOR_ROJO, 2)
        else:
            tiempo_inicio = time.perf_counter()
            tiempo_sueño_acumulado = 0.0
            color_actual = COLOR_VERDE
            alarma_activada = False

        # Dibujar valores en pantalla
        cv2.putText(frame, f"EAR: {round(EAR_promedio, 2)}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color_actual, 2)
        cv2.putText(frame, f"SUEÑO: {round(tiempo_sueño_acumulado, 2)} s", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color_actual, 2)

    else:
        # Si no se detecta una cara, reiniciar valores
        tiempo_inicio = time.perf_counter()
        tiempo_sueño_acumulado = 0.0
        color_actual = COLOR_VERDE
        alarma_activada = False

    cv2.putText(frame, f"Vision Nocturna: {'ON' if vision_nocturna else 'OFF'}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, COLOR_VERDE, 2)
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
