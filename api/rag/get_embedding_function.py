from functools import lru_cache
from settings.settings import Settings
from langchain_ollama.embeddings import OllamaEmbeddings


@lru_cache()
def get_embedding_function():
    embeddings = OllamaEmbeddings(model=Settings.ollama.embedding_model)
    return embeddings
