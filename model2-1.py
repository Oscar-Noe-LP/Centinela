import os
import av
import threading
import streamlit as st
from streamlit_webrtc import webrtc_streamer, VideoHTMLAttributes
from model2 import VideoFrameHandler
from pydub import AudioSegment
from pydub.playback import play
import simpleaudio as sa

# Ruta del sonido de alarma
alarm_file_path = os.path.join("audio", "wake_up.wav")

st.title("Drowsiness Detection!")

# Configuración de umbrales
EAR_THRESH = st.slider("Eye Aspect Ratio threshold:", 0.0, 0.4, 0.18, 0.01)
WAIT_TIME = st.slider("Seconds to wait before sounding alarm:", 0.0, 5.0, 1.0, 0.25)

thresholds = {"EAR_THRESH": EAR_THRESH, "WAIT_TIME": WAIT_TIME}

# Cargar el sonido de la alarma
alarm_sound = AudioSegment.from_wav(alarm_file_path)

# Para evitar conflictos entre hilos
lock = threading.Lock()
shared_state = {"play_alarm": False}

video_handler = VideoFrameHandler()

def play_audio():
    """Reproduce el sonido en un hilo separado."""
    wave_obj = sa.WaveObject.from_wave_file(alarm_file_path)
    play_obj = wave_obj.play()
    play_obj.wait_done()

def video_frame_callback(frame: av.VideoFrame):
    frame = frame.to_ndarray(format="bgr24")
    frame, play_alarm = video_handler.process(frame, thresholds)

    with lock:
        shared_state["play_alarm"] = play_alarm

    # Si se detecta fatiga, reproducir el sonido
    if play_alarm:
        threading.Thread(target=play_audio, daemon=True).start()

    return av.VideoFrame.from_ndarray(frame, format="bgr24")

# Inicializar el streamer de video
webrtc_streamer(
    key="driver-drowsiness-detection",
    video_frame_callback=video_frame_callback,
    rtc_configuration={"iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]},
    media_stream_constraints={"video": True, "audio": False},
    video_html_attrs=VideoHTMLAttributes(autoPlay=True, controls=False, muted=False),
)
