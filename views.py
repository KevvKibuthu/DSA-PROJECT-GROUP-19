from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return render(request, 'SocialGraph.html')
def elevator(request):
    return render(request, 'Elevator.html')


