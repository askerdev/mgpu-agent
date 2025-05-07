from settings.settings import Settings
from langchain_ollama.embeddings import OllamaEmbeddings


def get_embedding_function():
    embeddings = OllamaEmbeddings(model=Settings.ollama.embedding_model)
    return embeddings
