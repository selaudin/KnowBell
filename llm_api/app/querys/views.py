from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from neomodel import db


from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from django.conf import settings

@api_view(['GET'])
def get_title_(request):
    # openai_key = settings.openai_key
    openai_key = ""
    print(openai_key)
    
    llm = OpenAI(openai_api_key=openai_key)
    # question = request.query_params.get('question')
    question = "Can you find the account details for the user with the name 'John Smith'?"
    title = llm.predict(f"can you write a 10 titles for this question: '{question}'")

    print(title)    
    return Response({'title': title})