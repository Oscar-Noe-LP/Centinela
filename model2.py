from fastapi import FastAPI, File, UploadFile
import cv2
import time
import mediapipe as mp
from mediapipe.python.solutions.drawing_utils import _normalized_to_pixel_coordinates
from math import dist

pix = _normalized_to_pixel_coordinates

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
boca = [61, 82, 87, 178, 88, 311, 312, 317, 14, 402, 317, 291]


VERDE = (0, 255, 0)
ROJO = (0, 0, 255)
AZUL = (255, 0, 0)
LIMITE_EAR = 0.25  
LIMITE_MAR = 1.6
TIEMPO_OJOS_CERRADOS = 1.3  
TEMP_BOSTEZO_CONST = 2
tiempo_inicio = time.perf_counter()
tiempo_inicio_boca = time.perf_counter()
tiempo_fatiga_acumulada = 0.0
tiempo_bostezo = 0.0
alarma_activada = False
color_alerta = VERDE
color_boca = AZUL
vision_nocturna = False


camara = cv2.VideoCapture(0)

while camara.isOpened():
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
        
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    resultados = cara_detectada.process(frame_rgb)

    if resultados.multi_face_landmarks:
        puntos_cara = resultados.multi_face_landmarks[0].landmark
        alto, ancho, _ = frame.shape

        puntos_izq = []
        puntos_der = []
        puntos_boca = []

        for i in ojoizq:
            pci = puntos_cara[i]
            coordsi = pix(pci.x, pci.y, ancho, alto)
            puntos_izq.append(coordsi)

        for i in ojoder:
            pcd = puntos_cara[i]
            coordsd = pix(pcd.x, pcd.y, ancho, alto)
            puntos_der.append(coordsd)
        
        for i in boca:
            pcb = puntos_cara[i]
            coordsb = pix(pcb.x, pcb.y, ancho, alto)
            puntos_boca.append(coordsb)

        try:
            #Cálculo del EAR
            P1_P5_I = dist(puntos_izq[1], puntos_izq[5])
            P2_P4_I = dist(puntos_izq[2], puntos_izq[4])
            P0_P3_I = dist(puntos_izq[0], puntos_izq[3])
            
            P1_P5_D = dist(puntos_der[1], puntos_der[5])
            P2_P4_D = dist(puntos_der[2], puntos_der[4])
            P0_P3_D = dist(puntos_der[0], puntos_der[3])
            
            EAR_izq = (P1_P5_I + P2_P4_I) / (2.0 * P0_P3_I)
            EAR_der = (P1_P5_D + P2_P4_D) / (2.0 * P0_P3_D)
            EAR_promedio = (EAR_izq + EAR_der) / 2.0

            #Cálculo del MAR
            P0_P6_B = dist(puntos_boca[0], puntos_boca[6])
            P1_P11_B = dist(puntos_boca[1], puntos_boca[11])
            P2_P10_B = dist(puntos_boca[2], puntos_boca[10])
            P3_P9_B = dist(puntos_boca[3], puntos_boca[9])
            P4_P8_B = dist(puntos_boca[4], puntos_boca[8])
            P5_P7_B = dist(puntos_boca[5], puntos_boca[7])
            MAR_Norm = (P1_P11_B + P2_P10_B + P3_P9_B + P4_P8_B + P5_P7_B) / (2.0 * P0_P6_B)

        except:
            EAR_promedio = 0.0  
            MAR_norm = 0.0
 
        for punto in puntos_izq + puntos_der:
            cv2.circle(frame, punto, 2, color_alerta, -1)
        
        for point in puntos_boca:
            cv2.circle(frame, point, 2, color_boca, 1)

        if EAR_promedio < LIMITE_EAR:
            tiempo_actual = time.perf_counter()
            tiempo_fatiga_acumulada += tiempo_actual - tiempo_inicio
            tiempo_inicio = tiempo_actual
            color_alerta = ROJO

            if tiempo_fatiga_acumulada >= TIEMPO_OJOS_CERRADOS:
                alarma_activada = True
                cv2.putText(frame, "¡DESPIERTA!", (10, 250), cv2.FONT_HERSHEY_SIMPLEX, 1, ROJO, 2)
        else:
            tiempo_inicio = time.perf_counter()
            tiempo_fatiga_acumulada = 0.0
            color_alerta = VERDE
            alarma_activada = False
        
        if MAR_Norm > LIMITE_MAR:
            tiempo_act = time.perf_counter()
            tiempo_bostezo += tiempo_act - tiempo_inicio_boca
            tiempo_inicio_boca = tiempo_act
            color_boca = ROJO
            if tiempo_bostezo > TEMP_BOSTEZO_CONST:
                cv2.putText(frame, "¡ESTAS BOSTEZANDO!", (10, 300), cv2.FONT_HERSHEY_SIMPLEX, 1, ROJO, 2)
        else:
            tiempo_inicio_boca = time.perf_counter()
            tiempo_bostezo = 0.0
            color_boca = AZUL

        cv2.putText(frame, f"EAR: {round(EAR_promedio, 2)}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color_alerta, 2)
        cv2.putText(frame, f"Fatiga: {round(tiempo_fatiga_acumulada, 2)} s", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color_alerta, 2)
        cv2.putText(frame, f"MAR: {round(MAR_Norm, 2)}", (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color_boca, 2)
        cv2.putText(frame, f"Bostezo: {round(tiempo_bostezo, 2)} s", (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color_boca, 2)

    else:
        tiempo_inicio = time.perf_counter()
        tiempo_fatiga_acumulada = 0.0
        color_alerta = VERDE
        alarma_activada = False

    cv2.putText(frame, f"Vision Nocturna: {'ON' if vision_nocturna else 'OFF'}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, VERDE, 2)
    cv2.imshow("Detector de Fatiga", frame)


    tecla = cv2.waitKey(1) & 0xFF
    if tecla == ord('q'):  
        break
    elif tecla == ord('n'):  
        vision_nocturna = not vision_nocturna

camara.release()
cv2.destroyAllWindows()
