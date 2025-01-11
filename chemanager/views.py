from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import User, Laboratory 


# index view
def index(request):

    # get the labs
    labs = Laboratory.objects.all()
    total_products = 0

    # get the total counts of products in the labs
    for lab in labs:
        total_products += lab.count_products()

    return render(request, "chemanager/index.html", {
        "labs": labs,
        "total": total_products
    })


def logout_view(request):
    """
    Logout the user
    """
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def login_view(request):
    """
    Render the login view and log in the user through a POST method
    """
    if request.method == "POST":

        # get the user informations and try an authentification
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # check the authentification
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            messages.error(request, "Invalid username and/or password.")
            return render(request, "chemanager/login.html")

    return render(request, "chemanager/login.html")


def register(request):
    """
    Render the register view, and create an account via a POST method. After the creation of the account, log in the user.
    """
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        no_lab = request.POST["no_lab"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            messages.error(request, "Password must match!")
            return render(request, "chemanager/register.html")

        elif not username or not email or not password:
            messages.error(request, "Missing informations!")
            return render(request, "chemanager/register.html")
        
        # Try to get the correct laboratory to register the user
        if no_lab:
            laboratory = None
        else:
            lab_number = request.POST["laboratory"]
            try:
                laboratory = Laboratory.objects.get(lab_number=lab_number)
            except ObjectDoesNotExist:
                messages.error(request, "The laboratory you try to register on does not exist")
                return render(request, "chemanager/register.html")
        

        # Attempt to create new user and return an error if username already taken
        try:
            user = User.objects.create_user(username=username, email=email, password=password, laboratory=laboratory)
            user.save()
        except IntegrityError:
            messages.error(request, "Username already taken!")
            return render(request, "chemanager/register.html")

        # log the user and redirect to the index page if success
        login(request, user)
        messages.success(request, "Account successfully created!")
        return HttpResponseRedirect(reverse("index"))
    
    # If GET method, display the page
    if request.method == "GET":

        # get the laboratory for the form
        laboratories = Laboratory.objects.all()

        return render(request, "chemanager/register.html", {
            "laboratories": laboratories
        })
    
# inventory view
def inventory(request):
    return render(request, "chemanager/inventory.html")

# register view
def add_product(request):
    return render(request, "chemanager/add.html")


# -----------------------------------------------------------API Views

def site(request):
    """
    API route to get all the laboratories and the number of products they contains with the total on site.
    Method: GET
    URL: /site
    Authentication not required
    """
    if request.method == "GET":

        # get the labs
        labs = Laboratory.objects.all().order_by('lab_number')

        # get the total products on the site
        total = 0

        for lab in labs:
            total += lab.count_products()

        response_data = [lab.serialize() for lab in labs]
        return JsonResponse({"laboratories": response_data, "total": total}, status=200)
    
    else:
        return JsonResponse({'error': 'Bad request'}, status=400)



