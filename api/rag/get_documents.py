from langchain.text_splitter import CharacterTextSplitter
from langchain.document_loaders import TextLoader

loader = TextLoader("data/test.txt")
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)


def get_documents():
    documents = loader.load()
    chunks = text_splitter.split_documents(documents)
    return chunks
