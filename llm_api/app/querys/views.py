from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from neomodel import db


from langchain.chat_models import ChatOpenAI
from django.conf import settings
from langchain.document_loaders import PyPDFLoader
import os 


@api_view(['GET'])
def get_title_(request):
    # openai_key = settings.openai_key
    from langchain.llms import OpenAI    
    openai_key = "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"
    
    llm = OpenAI(openai_api_key=openai_key)
    question = request.query_params.get('question')
    
    # question = "Can you find the account details for the user with the name 'John Smith'?"
    title = llm.predict(f"can you write a 10 titles for this question: '{question}'")

    return Response({'title': title})

@api_view(['GET'])
def answer_promt(request):
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
    question = request.query_params.get('question')
    result = qa_chain({"query": question})
    # Check the result of the query
    # print(result["result"])
    # # Check the source document from where we 
    # print(result["source_documents"][0])

    return Response({'results': result})

