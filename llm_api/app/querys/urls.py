from django.urls import path
from . import views

urlpatterns = [
    path('get_title', views.get_title_),
    # path('post/', views.postData),
]