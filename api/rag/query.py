from functools import lru_cache
from settings.settings import Settings
from langchain_ollama import ChatOllama
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.retrievers.multi_query import MultiQueryRetriever
from get_vector_db import get_vector_db


@lru_cache()
def get_prompt():
    QUERY_PROMPT = PromptTemplate(
        input_variables=["question"],
        template="""You are an AI language model assistant. Your task is to generate five
        different versions of the given user question to retrieve relevant documents from
        a vector database. By generating multiple perspectives on the user question, your
        goal is to help the user overcome some of the limitations of the distance-based
        similarity search. Provide these alternative questions separated by newlines.
        Original question: {question}""",
    )

    template = """Answer the question based ONLY on the following context:
    {context}
    Question: {question}
    """

    prompt = ChatPromptTemplate.from_template(template)

    return QUERY_PROMPT, prompt


def query(input):
    # Initialize the language model with the specified model name
    llm = ChatOllama(model=Settings.ollama.chat_model)
    # Get the vector database instance
    db = get_vector_db()
    # Get the prompt templates
    QUERY_PROMPT, prompt = get_prompt()

    # Set up the retriever to generate multiple queries using the language model and the query prompt
    retriever = MultiQueryRetriever.from_llm(
        db.as_retriever(),
        llm,
        prompt=QUERY_PROMPT
    )

    # Define the processing chain to retrieve context, generate the answer, and parse the output
    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    response = chain.invoke(input)

    return response
