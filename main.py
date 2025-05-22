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
    conec = sqlite3.connect("sentinela.db")
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
            # Recibir datos como JSON
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
 
            # Procesar la imagen
            resultados = procesar_frame(frame)
 
            # Enviar resultados al cliente
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
 
        return {"mensaje": "Usuario creado con éxito"}
   
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno en el servidor")
    finally:
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
        return id_usuario  
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


@app.post("/contactos")
async def agregar_contacto(request: Request):
    datos = await request.json()
    nombre_contacto = datos.get("nombre_contacto")
    telefono_contacto = datos.get("telefono_contacto")
    rvp1 = datos.get("rvp1")
    if not nombre_contacto or not telefono_contacto or rvp1 is None:
        raise HTTPException(status_code=400, detail="Faltan datos necesarios")

    conexion = conectar()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            SELECT RVP5, Nombre_Contacto FROM Contactos_de_Confianza WHERE Teléfono_Contacto = ?
        """, (telefono_contacto,))
        resultado = cursor.fetchone()

        if resultado:
            rvp5 = resultado[0]
            nombre_contacto = resultado[1]
        else:
            cursor.execute("""
                INSERT INTO Contactos_de_Confianza (Nombre_Contacto, Teléfono_Contacto)
                VALUES (?, ?)
            """, (nombre_contacto, telefono_contacto))
            rvp5 = cursor.lastrowid

        cursor.execute("""
            SELECT RVP1, RVP5 FROM Contactos_Asociados WHERE RVP1 = ? AND RVP5 = ?
        """, (rvp1, rvp5))
        existe_asociacion = cursor.fetchone()
        if existe_asociacion:
            conexion.commit()
            conexion.close()                
        else:
            cursor.execute("""
                INSERT INTO Contactos_Asociados (RVP1, RVP5)
                VALUES (?, ?)
            """, (rvp1, rvp5))
            conexion.commit()
            conexion.close()

        return {
            "mensaje": "Contacto agregado y asociado con éxito",
            "id_contacto": rvp5,
            "id_usuario": rvp1,
            "nombre_contacto": nombre_contacto,
            "telefono_contacto": telefono_contacto
        }
    except Exception as e:
        conexion.rollback()
        conexion.close()
        raise HTTPException(status_code=500, detail=f"Error: {e}")


@app.post("/borrarcontacto")
async def eliminar_contacto_asociado(request: Request):
    try:
        datos = await request.json()
        rvp1 = datos.get("rvp1")
        rvp5 = datos.get("rvp5")

        if rvp1 is None or rvp5 is None:
            raise HTTPException(status_code=400, detail="Faltan id_usuario o id_contacto")

        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM Contactos_Asociados
            WHERE RVP1 = ? AND RVP5 = ?
        """, (rvp1, rvp5))
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Relación no encontrada.")

        cursor.execute("""
            SELECT COUNT(*) FROM Contactos_Asociados
            WHERE RVP5 = ?
        """, (rvp5,))
        resultado = cursor.fetchone()
        total = resultado[0] if resultado else 0
        if total == 0:
            cursor.execute("""
                DELETE FROM Contactos_de_Confianza
                WHERE RVP5 = ?
            """, (rvp5,))
        conn.commit()
        conn.close()
        return {"mensaje": "Contacto eliminado correctamente."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/contactosuser/{rvp1}")
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
    return [
        {"id_contacto": fila[0], "nombre_contacto": fila[1], "telefono_contacto": fila[2]}
        for fila in resultado
    ]


@app.post("/modo_padres")
async def agregar_hijo(request: Request):    
    datos = await request.json()
    rvp1 = datos.get("rvp1")
    rvp1_h = datos.get("rvp1_h")
    Nombre_hijo = datos.get("Nombre_hijo")
    Telefono_hijo = datos.get("Telefono_hijo")
    print(rvp1_h)
    conexion = conectar()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            INSERT INTO Modo_Padres (RVP1, RVP1_H, Nombre_hijo, Telefono_hijo)
            VALUES (?, ?, ?, ?)
        """, (rvp1, rvp1_h, Nombre_hijo, Telefono_hijo))
        conexion.commit()
        conexion.close()
        return {"message": "modo padres configurado",
                "rvp1_h": rvp1_h,
                "nombrehijo": Nombre_hijo,
                "telhijo": Telefono_hijo
                }
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {e}")


@app.post("/alertas")
async def generar_alerta(request: Request):
    data = await request.json()
    rvp2 = data.get("rvp2")
    fecha = data.get("fecha")
    hora = data.get("hora")
    ubicacion = data.get("ubicacion")
    Tipo = data.get("Tipo")
    conexion = conectar()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            INSERT INTO Alertas_Generadas (RVP2, Fecha, Hora, Ubicación, Tipo)
            VALUES (?, ?, ?, ?, ?)
        """, (rvp2, fecha, hora, ubicacion, Tipo))
        rvp3 = cursor.lastrowid

        cursor.execute("""
                INSERT INTO Alertas_por_sesion (RVP2, RVP3)
                VALUES (?, ?)               
            """, (rvp2, rvp3))

        conexion.commit()
        conexion.close()
        return {"mensaje": "alerta guardada"}
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {e}")     


@app.post("/sesiones")
async def registrar_sesion(request: Request):
    data = await request.json()
    rvp1 = data.get("rvp1")
    fecha_inicio = data.get("fecha_inicio")
    hora_inicio = data.get("hora_inicio")
    conexion = conectar()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            INSERT INTO Sesiones_de_Manejo (RVP1, Fecha_Inicio, Hora_Inicio)
            VALUES (?, ?, ?)
        """, (rvp1, fecha_inicio, hora_inicio))
        conexion.commit()
        conexion.close()
        return {"mensaje": "sesion registrada"}
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {e}")

@app.post("/sesion")
async def cerrar_sesion(request: Request):
    data = await request.json()
    rvp1 = data.get("rvp1")
    fecha_fin = data.get("fecha_fin")
    hora_fin = data.get("hora_fin")
    conexion = conectar()
    cursor = conexion.cursor()
    try:
        cursor.execute("""
            UPDATE Sesiones_de_Manejo
            SET Fecha_fin = ?, Hora_fin = ?
            WHERE RVP1 = ? AMD Fecha_fin IS NULL
        """, (rvp1, fecha_fin, hora_fin))
        conexion.commit()
        conexion.close()
        return {"mensaje": "sesion registrada"}
    except Exception as e:
        conexion.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {e}")



@app.put("/act_user")
async def actualizar_datos_usuario(rvp1: int, nombre: str, telefono: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Usuarios
        SET Nombre = ?, Teléfono = ?
        WHERE RVP1 = ?
    """, (nombre, telefono, rvp1))
    new = cursor.fetchone()
    conexion.commit()
    conexion.close()
    if new:
        return {"mensaje": "Usuario actualizado con éxito"}
    else:
        raise HTTPException(status_code=400, detail="Error al actualizar usuario")
 
@app.post("/tonos")
async def agregar_tono_sistema(nombre_tono: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Tonos (Nombre_del_Tono)
        VALUES (?)
    """, (nombre_tono,))
    tono = cursor.fetchone()
    conexion.commit()
    conexion.close()
    if tono:
        return {"mensaje": "tono agregado con éxito"}
    else:
        raise HTTPException(status_code=400, detail="Error al agregar tono")
 
@app.post("/configuracion")
async def configurar(rvp1: int, rvp8: int, alertas_visuales: bool, tema_app: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Configuración (RVP1, RVP8, Alertas_visuales, Tema_app)
        VALUES (?, ?, ?, ?)
    """, (rvp1, rvp8, alertas_visuales, tema_app))
    conf = cursor.fetchone()
    conexion.commit()
    conexion.close()
    if conf:
        return {"mensaje": "configuración establecida con éxito"}
    else:
        raise HTTPException(status_code=400, detail="Error al configurar app")
    
 
 
@app.post("/alertas/destinatarios")
async def notificar_contactos(rvp3: int, rvp5: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Destinatarios_de_Alertas (RVP3, RVP5)
        VALUES (?, ?)
    """, (rvp3, rvp5))
    desti = cursor.fetchone()
    conexion.commit()
    conexion.close()
    if desti:
        return {"mensaje": "contacto notificado"}
    else:
        raise HTTPException(status_code=400, detail="Error al notificar contacto")
 
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
    return resultado
 


@app.get("/sesion/{rvp1}")
def obtener_sesiones_manejo(rvp1: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Sesiones_de_Manejo.Fecha_Inicio, Sesiones_de_Manejo.Hora_Inicio, Sesiones_de_Manejo.Fecha_Fin, Sesiones_de_Manejo.Hora_Fin
        FROM Sesiones_de_Manejo
        WHERE Sesiones_de_Manejo.RVP1 = ? AND Sesiones_de_Manejo.Fecha_Fin >= CURRENT_DATE
    """, (rvp1,))
    resultado = cursor.fetchall()
    conexion.close()
    return resultado
 
@app.get("/alertas/sesion/{rvp1}")
def obtener_alertas(rvp1: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Alertas_Generadas.Fecha, Alertas_Generadas.Hora, Alertas_Generadas.Ubicación, Alertas_Generadas.Contenido
        FROM Alertas_Generadas
        JOIN Sesiones_de_Manejo ON Sesiones_de_Manejo.RVP2 = Alertas_Generadas.RVP2
        WHERE Sesiones_de_Manejo.RVP1 = ? AND Sesiones_de_Manejo.Fecha_Fin >= CURRENT_DATE
    """, (rvp1,))
    resultado = cursor.fetchall()
    conexion.close()
    return resultado
 
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
    return resultado
 
@app.get("/modo_padres/{rvp1}")
def obtener_modo_padre_usuario(rvp1: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Usuarios.Nombre, Modo_Padres.Tipo_de_notificación
        FROM Modo_Padres
        JOIN Usuarios ON Usuarios.RVP1 = Modo_Padres.RVP1_H
        WHERE Modo_Padres.RVP1 = ?
    """, (rvp1,))
    resultado = cursor.fetchone()
    conexion.close()
    return resultado
