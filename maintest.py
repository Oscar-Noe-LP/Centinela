from fastapi import FastAPI, HTTPException, File, UploadFile, WebSocket
import logging
from fastapi.middleware.gzip import GZipMiddleware
import cv2
import mediapipe as mp
from mediapipe.python.solutions.drawing_utils import _normalized_to_pixel_coordinates
from math import dist
import numpy as np


# Configuración de logs
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.get("/")
def inicio():
    return {"message": "Hola mundo, conexión correctamente realizada"}


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

def procesar_frame(frame):
    frame_gris = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    frame_mejorado = clahe.apply(frame_gris)
    frame_mejorado = cv2.GaussianBlur(frame_mejorado, (5, 5), 0)
    frame_nocturno = cv2.merge([frame_mejorado, frame_mejorado, frame_mejorado])
    framen = frame_nocturno
    frame_rgb = cv2.cvtColor(framen, cv2.COLOR_BGR2RGB)
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

            return {
                "EAR": round(EAR_promedio, 2),
                "MAR": round(MAR_Norm, 2),
                "Bostezo": MAR_Norm > 1.6,
                "Fatiga": EAR_promedio < 0.25
            }

        except Exception as e:
            return {"error": "Error calculando métricas", "detalle": str(e)}
    
    return {"Error": "No se detectó rostro"}
    

@app.websocket("/ws/deteccion")
async def webockt(websocket: WebSocket):
    await websocket.accept()
    logger.info("Cliente conectado al WebSocket")

    try:
        while True:
            data = await websocket.receive_bytes()
            npimg = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
            if frame is None:
                await websocket.send_json({"error": "Imagen inválida"})
                continue

            resultados = procesar_frame(frame)
            await websocket.send_json(resultados)

    except Exception as e:
        logger.error(f"WebSocket desconectado: {e}")
    finally:
        await websocket.close()

