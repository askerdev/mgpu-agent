import os


class Chroma:
    path = "root/mgpu-agent/api/chroma"
    data = "root/mgpu-agent/api/data"


class Ollama:
    embedding_model = "nomic-embed-text"
    chat_model = "gemma3:1b"


class Auth:
    cookie_key = "auth"
    vk_client_id = 53456359
    secret = os.urandom(24).hex()


class Settings:
    db_url: str = "sqlite:///root/mgpu-agent/api/database.db"
    ollama = Ollama
    chroma = Chroma
    auth = Auth
