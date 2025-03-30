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
    return sqlite3.connect("centinela.db")

@app.get("/users")
def usuarios():
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM Usuarios")
    usuarios = cursor.fetchall()
    conexion.close()
    if not usuarios:
        return {"message": "No hay usuarios registrados"}
    else:
        return [{"id": user[0], "name": user[1]} for user in usuarios]


@app.get("/obtener_usuario/{RVP1}")
def usuario(RVP1: int):
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM Usuarios WHERE RVP1 = ?", (RVP1,))
    usuario = cursor.fetchone()
    conexion.close()
    if usuario:
        return {"id": usuario[0], "name": usuario[1]}
    else:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")


