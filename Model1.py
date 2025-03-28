import cv2
import numpy as np
import dlib
from imutils import face_utils

cap = cv2.VideoCapture(0)

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

sueño = 0
fatiga = 0
despierto = 0
estado = ""
color = (0, 0, 0)

def compute(ptA, ptB):
    return np.linalg.norm(ptA - ptB)

def blinked(a, b, c, d, e, f):
    up = compute(b, d) + compute(c, e)
    down = compute(a, f)
    ratio = up / (2.0 * down)

    # Checking if the eye is blinked
    if ratio > 0.25:
        return 2
    elif (ratio>0.21 and ratio <= 0.25):
        return 1
    else:
        return 0

while True:
    _, frame = cap.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = detector(gray)
    face_frame = None 

    for face in faces:
        x1, y1, x2, y2 = face.left(), face.top(), face.right(), face.bottom()
        face_frame = frame.copy()
        cv2.rectangle(face_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        landmarks = predictor(gray, face)
        landmarks = face_utils.shape_to_np(landmarks)

        left_blink = blinked(landmarks[36], landmarks[37], landmarks[38], landmarks[41], landmarks[40], landmarks[39])
        right_blink = blinked(landmarks[42], landmarks[43], landmarks[44], landmarks[47], landmarks[46], landmarks[45])

        if left_blink == 0 or right_blink == 0:
            sueño += 1
            fatiga = 0
            despierto = 0
            if sueño > 6:
                estado = "DESPIERTA !!!"
                color = (255, 0, 0)

        elif left_blink == 1 or right_blink == 1:
            sueño = 0
            despierto = 0
            fatiga += 1
            if fatiga > 6:
                estado = "Somnoliento"
                color = (0, 0, 255)

        else:
            fatiga = 0
            sueño = 0
            despierto += 1
            if despierto > 6:
                estado = "Despierto"
                color = (0, 255, 0)

        cv2.putText(frame, estado, (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)

        for (x, y) in landmarks:
            cv2.circle(face_frame, (x, y), 1, (255, 255, 255), -1)

    cv2.imshow("Frame", frame)

    if face_frame is not None:
        cv2.imshow("Result of detector", face_frame)

    key = cv2.waitKey(1)
    if key == 27:  
        break

cap.release()
cv2.destroyAllWindows()
