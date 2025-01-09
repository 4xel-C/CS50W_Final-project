from django.shortcuts import render

# index view
def index(request):
    return render(request, "chemanager/index.html")
    
def login(request):
    return render(request, "chemanager/login.html")