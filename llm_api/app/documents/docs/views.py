from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from neomodel import db
import requests
import time

# Create your views here.
@api_view(['GET'])
def getData(request):
    # user = db.cypher_query(
    # '''
    # MATCH (n:User)
    # RETURN n
    # '''
    # )[0]
    # print(user)
    # # return Response()

    # Fatjon logic to get data and store in graph
    # get data from API for different categories
    categories =  ["SAP", "ServiceNow", "General", "MDE", "Guideline"]
    auth = ("BaselHack2023", "Tc13cspLs!eAve")


    for search_query in categories:

        # Define the API URL with the search query as a parameter
        api_url = f'https://bfgtest.service-now.com/api/besag/search_knowledge_baselhack2023/searchkb/{search_query}'
        # print(api_url)

        # Make a GET request to the API
        response = requests.get(api_url, auth=auth)
        # print(response)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            data = response.json()
            # print(data["result"][0])
            # Store data in the db
            for result in data["result"]:
                db.cypher_query(
                    '''
                    MERGE (d:Document{id: $result['number']})
                    SET d += $result, d.context = 'tbd', d.tags = 'tbd'
                    ''', result
                )
        else:
            # Handle the case where the API request fails
            print("API call failed!")

        # Sleep for the specified duration
        time.sleep(7)



