import sqlite3

def conectar():
    return sqlite3.connect("centinela.db")

def usuarios():
    conexion = conectar()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM Usuarios")
    usuarios = cursor.fetchall()
    conexion.close()
    if not usuarios:
        return ("No hay usuarios registrados")
    else:
        return usuarios


users = usuarios()


if not users:
    print("No hay usuarios registrados.")
else:
    print("Usuarios registrados:")
    for usuario in users:
        print(usuario)  




