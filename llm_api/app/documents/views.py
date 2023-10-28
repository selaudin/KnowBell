from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from neomodel import db


# Create your views here.
@api_view(['GET'])
def getData(request):
    user = db.cypher_query(
    '''
    MATCH (n:User)
    RETURN n
    '''
    )[0]
    print(user)
    return Response()