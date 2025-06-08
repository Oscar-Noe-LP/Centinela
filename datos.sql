-- Activa las claves foráneas
PRAGMA foreign_keys = ON;

-- Inserta tonos
INSERT INTO Tonos (RVP8, Nombre_del_Tono) VALUES
(1, 'Tono Agudo'),
(2, 'Tono Grave');

-- Inserta usuarios
INSERT INTO Usuarios (RVP1, Nombre, Buzón, wlst, Tipo_de_usuario, Teléfono) VALUES
(1, 'Oscar Ramírez', 'oscar@mail.com', 'contraseña123', 'Conductor', '5551234567'),
(2, 'Ana López', 'ana@mail.com', 'anaSegura456', 'Conductor', '5559876543');

-- Configuración por usuario
INSERT INTO Configuración (RVP7, RVP1, RVP8, Alertas_visuales, Tema_app) VALUES
(1, 1, 1, 1, 'Oscuro'),
(2, 2, 2, 0, 'Claro');

-- Contactos de confianza
INSERT INTO Contactos_de_Confianza (RVP5, Nombre_Contacto, Teléfono_Contacto) VALUES
(1, 'Mamá de Oscar', '5551112222'),
(2, 'Papá de Oscar', '5553334444'),
(3, 'Hermano de Ana', '5555556666');

-- Contactos asociados
INSERT INTO Contactos_Asociados (RVP1, RVP5) VALUES
(1, 1),
(1, 2),
(2, 3);

-- Sesiones de manejo para Oscar (usuario 1)
INSERT INTO Sesiones_de_Manejo (RVP2, RVP1, Fecha_Inicio, Hora_Inicio, Fecha_Fin, Hora_Fin) VALUES
(1, 1, '2025-06-01', '08:00', '2025-06-01', '08:30'),
(2, 1, '2025-06-02', '09:15', '2025-06-02', '09:45');

-- Sesiones de manejo para Ana (usuario 2)
INSERT INTO Sesiones_de_Manejo (RVP2, RVP1, Fecha_Inicio, Hora_Inicio, Fecha_Fin, Hora_Fin) VALUES
(3, 2, '2025-06-01', '10:00', '2025-06-01', '10:40'),
(4, 2, '2025-06-03', '11:20', '2025-06-03', '11:50');

-- Alertas generadas
INSERT INTO Alertas_Generadas (RVP3, Fecha, Hora, Ubicación, Tipo) VALUES
(1, '2025-06-01', '08:05', 'CDMX', 'Fatiga'),
(2, '2025-06-01', '08:15', 'CDMX', 'Distracción'),
(3, '2025-06-01', '08:25', 'CDMX', 'Cierre de ojos'),
(4, '2025-06-02', '09:20', 'CDMX', 'Fatiga'),
(5, '2025-06-02', '09:30', 'CDMX', 'Bostezo'),
(6, '2025-06-02', '09:40', 'CDMX', 'Pérdida de enfoque'),
(7, '2025-06-01', '10:10', 'GDL', 'Cierre de ojos'),
(8, '2025-06-01', '10:20', 'GDL', 'Fatiga'),
(9, '2025-06-01', '10:35', 'GDL', 'Distracción'),
(10, '2025-06-03', '11:25', 'GDL', 'Bostezo'),
(11, '2025-06-03', '11:35', 'GDL', 'Cierre de ojos'),
(12, '2025-06-03', '11:45', 'GDL', 'Somnolencia');

-- Alertas por sesión
INSERT INTO Alertas_por_sesion (RVP2, RVP3) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 5), (2, 6),
(3, 7), (3, 8), (3, 9),
(4, 10), (4, 11), (4, 12);

-- Destinatarios de alertas (todas para sus contactos)
INSERT INTO Destinatarios_de_Alertas (RVP3, RVP5) VALUES
(1, 1), (2, 1), (3, 2), (4, 2), (5, 1), (6, 2),
(7, 3), (8, 3), (9, 3), (10, 3), (11, 3), (12, 3);
