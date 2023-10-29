from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from neomodel import db
from langchain.document_loaders import PyPDFLoader
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain


from bs4 import BeautifulSoup


from langchain.vectorstores import Chroma



from django.conf import settings
import os
import requests




# Create your views here.
@api_view(['GET'])
def load_data(request):
    # vector_db = vectorize_the_context()
    # get_answer(vector_db)
    answer_promt()
    return Response()



def get_context_tag(text):
    from langchain.text_splitter import CharacterTextSplitter
    text_splitter = CharacterTextSplitter(
    separator="\n",
    chunk_size=1000,
    chunk_overlap=150,
    length_function=len
    )

    docs = text_splitter.split_documents(text)


def vectorize_the_context():
    openai_key = "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"
    from langchain.document_loaders import PyPDFLoader
    directory = os.path.join(settings.BASE_DIR, "documents/docs/")
    # print([os.path.join(directory, f) for f in os.listdir(directory) if f.endswith('.pdf')])
    loaders = [PyPDFLoader(os.path.join(directory, f)) for f in os.listdir(directory) if f.endswith('.pdf')]
    
    # # Load PDF
    docs = []
    for loader in loaders:
        docs.extend(loader.load())
    
    # Define the Text Splitter 
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size = 1500,
        chunk_overlap = 150
    )

    # #Create a split of the document using the text splitter
    splits = text_splitter.split_documents(docs)

    from langchain.vectorstores import Chroma
    from langchain.embeddings.openai import OpenAIEmbeddings

    embedding = OpenAIEmbeddings(openai_api_key=openai_key)


    persist_directory = os.path.join(settings.BASE_DIR, "mydata")


    # Create the vector store
    vectordb = Chroma.from_documents(
        documents=splits,
        embedding=embedding,
        persist_directory=persist_directory
    )
    return vectordb


def get_answer(vectordb):
    def pretty_print_docs(docs):
        print(f"\n{'-' * 100}\n".join([f"Document {i+1}:\n\n" + d.page_content for i, d in enumerate(docs)]))
    openai_key = "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"

    question = "is there an email i can ask for help"

    docs = vectordb.similarity_search(question,k=5)

    # Check the length of the document
    print(docs)

    # Check the content of the first document
    pretty_print_docs(docs)

    # Persist the database to use it later
    vectordb.persist()

    from langchain.llms import OpenAI
    from langchain.retrievers.self_query.base import SelfQueryRetriever
    from langchain.chains.query_constructor.base import AttributeInfo


    metadata_field_info = [
    AttributeInfo(
        name="source",
    
        description="The lecture the chunk is from, should be one of `docs/cs229_lectures/MachineLearning-Lecture01.pdf`, `docs/cs229_lectures/MachineLearning-Lecture02.pdf`, or `docs/cs229_lectures/MachineLearning-Lecture03.pdf`",
        type="string",
    ),
    AttributeInfo(
        name="page",
        description="The page from the lecture",
        type="integer",
    ),
    ]
    document_content_description = "Lecture notes"   
    llm = OpenAI(temperature=0, openai_api_key=openai_key)
    retriever = SelfQueryRetriever.from_llm(
        llm,
        vectordb,
        document_content_description,
        metadata_field_info,
        verbose=True
    )
    question = "what did they say about regression in the third lecture?"
    docs = retriever.get_relevant_documents(question)
    pretty_print_docs(docs)




def answer_promt():
    openai_key = "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"

    # Load vector database that was persisted earlier and check collection count in it
    from langchain.vectorstores import Chroma
    from langchain.embeddings.openai import OpenAIEmbeddings
    from langchain.chains import RetrievalQA
    from langchain.prompts import PromptTemplate
    from langchain.chat_models import ChatOpenAI
    persist_directory = os.path.join(settings.BASE_DIR, "mydata")
    embedding = OpenAIEmbeddings(openai_api_key=openai_key)
    vectordb = Chroma(persist_directory=persist_directory, embedding_function=embedding)
    llm = ChatOpenAI(temperature=0, openai_api_key=openai_key)

    template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that "you don't know, Can you provide us more hints", don't try to make up an answer. Use three sentences maximum. Keep the answer as concise as possible. Always say "Thanks" at the end of the answer. 
    {context}
    Question: {question}
    Helpful Answer:"""
    QA_CHAIN_PROMPT = PromptTemplate.from_template(template)# Run chain
    qa_chain = RetrievalQA.from_chain_type(
        llm,
        retriever=vectordb.as_retriever(),
        return_source_documents=True,
        chain_type_kwargs={"prompt": QA_CHAIN_PROMPT}
        )
    question = "how can i use Cico Jabber"
    result = qa_chain({"query": question})
    # Check the result of the query
    print(result["result"])
    # # Check the source document from where we 
    print(result["source_documents"][0])

    