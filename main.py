from fastapi import FastAPI, WebSocket, HTTPException, Request
import logging
from fastapi.middleware.gzip import GZipMiddleware
import cv2
import sqlite3
import mediapipe as mp
from mediapipe.python.solutions.drawing_utils import _normalized_to_pixel_coordinates
from math import dist
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
import base64
import traceback

# Configuración de logs
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

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

def conectar():
    conec = sqlite3.connect("centinela.db")
    conec.execute('PRAGMA foreign_keys = ON;')
    return conec

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
async def websocket(websocket: WebSocket):
    await websocket.accept()
    logger.info("Cliente conectado al WebSocket")

    try:
        while True:
            data = await websocket.receive_json()
            
            if "imagen" not in data:
                await websocket.send_json({"error": "No se encontró la clave 'imagen'"})
                continue

            imagen_base64 = data["imagen"]
            try:
                img_data = base64.b64decode(imagen_base64)
                npimg = np.frombuffer(img_data, np.uint8)
                frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
            except Exception as e:
                await websocket.send_json({"error": f"Error al decodificar la imagen: {e}"})
                continue

            if frame is None:
                await websocket.send_json({"error": "Imagen inválida"})
                continue

            resultados = procesar_frame(frame)
            await websocket.send_json(resultados)

    except Exception as e:
        logger.error(f"WebSocket desconectado: {e}")
    finally:
        try:
            await websocket.close()
        except RuntimeError:
            logger.info("El WebSocket ya se había cerrado.")

@app.post("/registro")
async def agregar_nuevo_usuario(request: Request):
    try:
        data = await request.json()
        nombre = data.get('nombre')
        buzon = data.get('buzon')
        wlst = data.get('wlst')
        tipo_usuario = data.get('tipo_usuario')
        telefono = data.get('telefono')

        if not all([nombre, buzon, wlst, tipo_usuario, telefono]):
            raise HTTPException(status_code=400, detail="Faltan campos")

        conexion = conectar()
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO Usuarios (Nombre, Buzón, wlst, Tipo_de_usuario, Teléfono)
            VALUES (?, ?, ?, ?, ?)
        """, (nombre, buzon, wlst, tipo_usuario, telefono))
        conexion.commit()
        cursor.execute("SELECT last_insert_rowid()")
        rvp1 = cursor.fetchone()[0]
        conexion.close()
        return {"id": str(rvp1), "mensaje": "Usuario creado con éxito"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno en el servidor: {str(e)}")
    finally:
        if 'conexion' in locals():
            conexion.close()

@app.post("/login")
async def login_usuario(request: Request):
    data = await request.json()  
    buzon = data.get('buzon')
    wlst = data.get('wlst')

    if not buzon or not wlst:
        raise HTTPException(status_code=400, detail="Faltan campos")

    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT RVP1, Nombre, Buzón
        FROM Usuarios
        WHERE Buzón = ? AND wlst = ?
    """, (buzon, wlst))
    user = cursor.fetchone()  
    conexion.close()
    
    if user:
        id_usuario = user[0]
        return {"id": str(id_usuario), "nombre": user[1], "buzon": user[2]}
    else:
        raise HTTPException(status_code=400, detail="Error al obtener usuario")

@app.get("/usuario/{rvp1}")
async def obtener_usuario(rvp1: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Nombre, Buzón, Tipo_de_usuario, Teléfono
        FROM Usuarios
        WHERE RVP1 = ?
    """, (rvp1,))
    datosuser = cursor.fetchone()
    conexion.close()

    if datosuser:
        return {
            "Nombre": datosuser[0],
            "Buzón": datosuser[1],
            "Tipousuario": datosuser[2],
            "Teléfono": datosuser[3]
        }
    else:
        raise HTTPException(status_code=400, detail="Error al obtener datos del usuario")

@app.put("/act_user")
async def actualizar_datos_usuario(rvp1: int, nombre: str, telefono: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Usuarios
        SET Nombre = ?, Teléfono = ?
        WHERE RVP1 = ?
    """, (nombre, telefono, rvp1))
    if cursor.rowcount == 0:
        conexion.close()
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    conexion.commit()
    conexion.close()
    return {"mensaje": "Usuario actualizado con éxito"}

@app.post("/tonos")
async def agregar_tono_sistema(nombre_tono: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Tonos (Nombre_del_Tono)
        VALUES (?)
    """, (nombre_tono,))
    conexion.commit()
    cursor.execute("SELECT last_insert_rowid()")
    rvp8 = cursor.fetchone()[0]
    conexion.close()
    return {"id": str(rvp8), "mensaje": "Tono agregado con éxito"}

@app.post("/configuracion")
async def configurar(rvp1: int, rvp8: int, alertas_visuales: bool, tema_app: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Configuración (RVP1, RVP8, Alertas_visuales, Tema_app)
        VALUES (?, ?, ?, ?)
    """, (rvp1, rvp8, alertas_visuales, tema_app))
    conexion.commit()
    cursor.execute("SELECT last_insert_rowid()")
    rvp7 = cursor.fetchone()[0]
    conexion.close()
    return {"id": str(rvp7), "mensaje": "Configuración establecida con éxito"}

@app.post("/contactos")
async def agregar_contacto(nombre_contacto: str, telefono_contacto: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Contactos_de_Confianza (Nombre_Contacto, Teléfono_Contacto)
        VALUES (?, ?)
    """, (nombre_contacto, telefono_contacto))
    conexion.commit()
    cursor.execute("SELECT last_insert_rowid()")
    rvp5 = cursor.fetchone()[0]
    conexion.close()
    return {"id": str(rvp5), "mensaje": "Contacto agregado con éxito"}

@app.post("/contactos/asociar")
async def asociar_contacto_confiable_usuario(rvp1: int, rvp5: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Contactos_Asociados (RVP1, RVP5)
        VALUES (?, ?)
    """, (rvp1, rvp5))
    conexion.commit()
    conexion.close()
    return {"mensaje": "Contacto asociado con éxito"}

@app.post("/sesion")
async def registrar_sesion_manejo_usuario(rvp1: int, fecha_inicio: str, hora_inicio: str, fecha_fin: str, hora_fin: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Sesiones_de_Manejo (RVP1, Fecha_Inicio, Hora_Inicio, Fecha_Fin, Hora_Fin)
        VALUES (?, ?, ?, ?, ?)
    """, (rvp1, fecha_inicio, hora_inicio, fecha_fin, hora_fin))
    conexion.commit()
    cursor.execute("SELECT last_insert_rowid()")
    rvp2 = cursor.fetchone()[0]
    conexion.close()
    return {"id": str(rvp2), "mensaje": "Sesión registrada con éxito"}

@app.post("/alertas")
async def generar_alerta(rvp2: int, fecha: str, hora: str, ubicacion: str, contenido: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Alertas_Generadas (RVP2, Fecha, Hora, Ubicación, Contenido)
        VALUES (?, ?, ?, ?, ?)
    """, (rvp2, fecha, hora, ubicacion, contenido))
    conexion.commit()
    cursor.execute("SELECT last_insert_rowid()")
    rvp3 = cursor.fetchone()[0]
    conexion.close()
    return {"id": str(rvp3), "mensaje": "Alerta guardada con éxito"}

@app.post("/alertas/destinatarios")
async def notificar_contactos(rvp3: int, rvp5: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Destinatarios_de_Alertas (RVP3, RVP5)
        VALUES (?, ?)
    """, (rvp3, rvp5))
    conexion.commit()
    conexion.close()
    return {"mensaje": "Contacto notificado con éxito"}

@app.post("/modo_padres")
async def configurar_modo_padres(rvp1: int, rvp1_h: int, nombre_hijo: str, telefono_hijo: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Modo_Padres (RVP1, RVP1_H, Nombre_hijo, Telefono_hijo)
        VALUES (?, ?, ?, ?)
    """, (rvp1, rvp1_h, nombre_hijo, telefono_hijo))
    conexion.commit()
    cursor.execute("SELECT last_insert_rowid()")
    rvp9 = cursor.fetchone()[0]
    conexion.close()
    return {"id": str(rvp9), "mensaje": "Modo padres configurado con éxito"}

@app.get("/modo_padres/{rvp1}")
async def obtener_hijos(rvp1: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT RVP9, RVP1_H, Nombre_hijo, Telefono_hijo
        FROM Modo_Padres
        WHERE RVP1 = ?
    """, (rvp1,))
    resultado = cursor.fetchall()
    conexion.close()
    return [{"id": str(row[0]), "rvp1_h": str(row[1]), "nombre": row[2], "telefono": row[3]} for row in resultado]

@app.delete("/modo_padres/{rvp1}/{rvp9}")
async def eliminar_hijo(rvp1: int, rvp9: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        DELETE FROM Modo_Padres
        WHERE RVP1 = ? AND RVP9 = ?
    """, (rvp1, rvp9))
    if cursor.rowcount == 0:
        conexion.close()
        raise HTTPException(status_code=404, detail="Hijo no encontrado")
    conexion.commit()
    conexion.close()
    return {"mensaje": "Hijo eliminado con éxito"}

@app.get("/configuracion/{rvp1}")
async def obtener_configuracion_usuario(rvp1: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Configuración.Alertas_visuales, Configuración.Tema_app, Tonos.Nombre_del_Tono
        FROM Configuración
        JOIN Tonos ON Configuración.RVP8 = Tonos.RVP8
        WHERE Configuración.RVP1 = ?
    """, (rvp1,))
    resultado = cursor.fetchone()
    conexion.close()
    if resultado:
        return {
            "Alertas_visuales": resultado[0],
            "Tema_app": resultado[1],
            "Nombre_del_Tono": resultado[2]
        }
    else:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")

@app.get("/contactos/{rvp1}")
async def obtener_contactos_confiables_usuario(rvp1: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Contactos_de_Confianza.RVP5, Contactos_de_Confianza.Nombre_Contacto, Contactos_de_Confianza.Teléfono_Contacto
        FROM Contactos_de_Confianza
        JOIN Contactos_Asociados ON Contactos_Asociados.RVP5 = Contactos_de_Confianza.RVP5
        WHERE Contactos_Asociados.RVP1 = ?
    """, (rvp1,))
    resultado = cursor.fetchall()
    conexion.close()
    return [{"id": str(row[0]), "nombre": row[1], "telefono": row[2]} for row in resultado]

@app.get("/sesion/{rvp1}")
def obtener_sesiones_manejo(rvp1: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT RVP2, Fecha_Inicio, Hora_Inicio, Fecha_Fin, Hora_Fin
        FROM Sesiones_de_Manejo
        WHERE RVP1 = ? AND Fecha_Fin >= CURRENT_DATE
    """, (rvp1,))
    resultado = cursor.fetchall()
    conexion.close()
    return [{"id": str(row[0]), "Fecha_Inicio": row[1], "Hora_Inicio": row[2], "Fecha_Fin": row[3], "Hora_Fin": row[4]} for row in resultado]

@app.get("/alertas/sesion/{rvp1}")
def obtener_alertas(rvp1: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Alertas_Generadas.RVP3, Alertas_Generadas.Fecha, Alertas_Generadas.Hora, Alertas_Generadas.Ubicación, Alertas_Generadas.Contenido
        FROM Alertas_Generadas
        JOIN Sesiones_de_Manejo ON Sesiones_de_Manejo.RVP2 = Alertas_Generadas.RVP2
        WHERE Sesiones_de_Manejo.RVP1 = ? AND Sesiones_de_Manejo.Fecha_Fin >= CURRENT_DATE
    """, (rvp1,))
    resultado = cursor.fetchall()
    conexion.close()
    return [{"id": str(row[0]), "Fecha": row[1], "Hora": row[2], "Ubicación": row[3], "Contenido": row[4]} for row in resultado]

@app.get("/alertas/destinatarios/{rvp3}")
def obtener_destinatarios_alerta(rvp3: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Contactos_de_Confianza.Nombre_Contacto, Contactos_de_Confianza.Teléfono_Contacto
        FROM Destinatarios_de_Alertas
        JOIN Contactos_de_Confianza ON Contactos_de_Confianza.RVP5 = Destinatarios_de_Alertas.RVP5
        WHERE Destinatarios_de_Alertas.RVP3 = ?
    """, (rvp3,))
    resultado = cursor.fetchall()
    conexion.close()
    return [{"Nombre_Contacto": row[0], "Teléfono_Contacto": row[1]} for row in resultado]

@app.delete("/contactos/{rvp1}/{rvp5}")
def eliminar_contacto_confiable_usuario(rvp1: int, rvp5: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        DELETE FROM Contactos_Asociados
        WHERE RVP1 = ? AND RVP5 = ?
    """, (rvp1, rvp5))
    if cursor.rowcount == 0:
        conexion.close()
        raise HTTPException(status_code=404, detail="Contacto no encontrado")
    conexion.commit()
    conexion.close()
    return {"mensaje": "Contacto eliminado con éxito"}