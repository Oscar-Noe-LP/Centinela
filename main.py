from fastapi import FastAPI, HTTPException
import logging
from fastapi.middleware.gzip import GZipMiddleware
import sqlite3

# Configuración de logs
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.get("/")
def inicio():
    return {"message": "Hola mundo, conexión correctamente realizada"}

def conectar():
    conec = sqlite3.connect("centinela.db")
    conec.execute('PRAGMA foreign_keys = ON;')
    return conec

@app.post("/registro")
async def agregar_nuevo_usuario(nombre:str, buzon: str, wlst: str, tipo_usuario: str, telefono: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Usuarios (Nombre, Buzón, wlst, Tipo_de_usuario, Teléfono)
        VALUES (?, ?, ?, ?, ?)
    """, (nombre, buzon, wlst, tipo_usuario, telefono))
    usuario = cursor.fetchone()
    conexion.commit()
    conexion.close()
    if usuario:
        return {"mensaje": "Usuario creado con éxito"}
    else:
        raise HTTPException(status_code=400, detail="Error al crear el usuario")

@app.post("/login")
async def login_usuario(buzon: str, wlst: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT RVP1, Nombre, Buzón
        FROM Usuarios
        WHERE Buzón = ? AND wlst = ?
    """, (buzon, wlst))
    resultado = cursor.fetchone()  
    conexion.close()
    
    if resultado:
        return resultado  
    else:
        raise HTTPException(status_code=400, detail="Error al obtener usuario")


@app.put("/actu_user")
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
async def configurar_alertas_usuario(rvp1: int, rvp8: int, alertas_visuales: bool, tema_app: str):
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

@app.post("/contactos")
def agregar_contacto(nombre_contacto: str, telefono_contacto: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Contactos_de_Confianza (Nombre_Contacto, Teléfono_Contacto)
        VALUES (?, ?)
    """, (nombre_contacto, telefono_contacto))
    cont = cursor.fetchone()
    conexion.commit()
    conexion.close()
    if cont:
        return {"mensaje": "contacto agregado con éxito"}
    else:
        raise HTTPException(status_code=400, detail="Error al agregar contacto")

@app.post("/contactos/asociar")
def asociar_contacto_confiable_usuario(rvp1: int, rvp5: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Contactos_Asociados (RVP1, RVP5)
        VALUES (?, ?)
    """, (rvp1, rvp5))
    asoc = cursor.fetchone()
    conexion.commit()
    conexion.close()
    if asoc:
        return {"mensaje": "contacto asociado"}
    else:
        raise HTTPException(status_code=400, detail="Error al asociar contacto")
    
@app.post("/sesion")
def registrar_sesion_manejo_usuario(rvp1: int, fecha_inicio: str, hora_inicio: str, fecha_fin: str, hora_fin: str):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Sesiones_de_Manejo (RVP1, Fecha_Inicio, Hora_Inicio, Fecha_Fin, Hora_Fin)
        VALUES (?, ?, ?, ?, ?)
    """, (rvp1, fecha_inicio, hora_inicio, fecha_fin, hora_fin))
    sesion = cursor.fetchone()
    conexion.commit()
    conexion.close()
    if sesion:
        return {"mensaje": "sesion registrada"}
    else:
        raise HTTPException(status_code=400, detail="Error al registrar sesion")

# 7. Generar una alerta para una sesión de manejo
def generar_alerta_sesion_manejo(rvp2, fecha, hora, ubicacion, contenido):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Alertas_Generadas (RVP2, Fecha, Hora, Ubicación, Contenido)
        VALUES (?, ?, ?, ?, ?)
    """, (rvp2, fecha, hora, ubicacion, contenido))
    conexion.commit()
    conexion.close()

# 8. Notificar a los contactos de confianza sobre una alerta
def notificar_contactos_confiables_alerta(rvp3, rvp5):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Destinatarios_de_Alertas (RVP3, RVP5)
        VALUES (?, ?)
    """, (rvp3, rvp5))
    conexion.commit()
    conexion.close()

# 9. Configuración del modo para los padres
def configurar_modo_padres_usuario(rvp1, rvp1_h, tipo_notificacion):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Modo_Padres (RVP1, RVP1_H, Tipo_de_notificación)
        VALUES (?, ?, ?)
    """, (rvp1, rvp1_h, tipo_notificacion))
    conexion.commit()
    conexion.close()

# 10. Obtener la configuración de un usuario
def obtener_configuracion_usuario(rvp1):
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

# 11. Obtener los contactos de confianza asociados a un usuario
def obtener_contactos_confiables_usuario(rvp1):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Contactos_de_Confianza.Nombre_Contacto, Contactos_de_Confianza.Teléfono_Contacto
        FROM Contactos_de_Confianza
        JOIN Contactos_Asociados ON Contactos_Asociados.RVP5 = Contactos_de_Confianza.RVP5
        WHERE Contactos_Asociados.RVP1 = ?
    """, (rvp1,))
    resultado = cursor.fetchall()
    conexion.close()
    return resultado

# 12. Obtener las sesiones de manejo activas de un usuario
def obtener_sesiones_manejo_activas_usuario(rvp1):
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

# 13. Obtener las alertas generadas para una sesión de manejo
def obtener_alertas_generadas_sesion(rvp1):
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

# 14. Obtener los destinatarios de una alerta
def obtener_destinatarios_alerta(rvp3):
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

# 15. Obtener el modo de monitoreo parental
def obtener_modo_padre_usuario(rvp1):
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

# 16. Eliminar un contacto de confianza
def eliminar_contacto_confiable_usuario(rvp1, rvp5):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        DELETE FROM Contactos_Asociados
        WHERE RVP1 = ? AND RVP5 = ?
    """, (rvp1, rvp5))
    conexion.commit()
    conexion.close()

# 17. Eliminar una sesión de manejo
def eliminar_sesion_manejo_usuario(rvp2):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("""
        DELETE FROM Sesiones_de_Manejo
        WHERE RVP2 = ?
    """, (rvp2,))
    conexion.commit()
    conexion.close()

