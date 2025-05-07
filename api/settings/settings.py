class Chroma:
    path = "chroma"
    data = "data"


class Ollama:
    embedding_model = "nomic-embed-text"
    chat_model = "gemma3:1b"


class Settings:
    db_url: str = "sqlite:///database.db"
    ollama = Ollama
    chroma = Chroma
