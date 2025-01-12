from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import User, Laboratory
from .helpers import query_products


# index view
def index(request):
    return render(request, "chemanager/index.html")


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
                messages.error(
                    request, "The laboratory you try to register on does not exist"
                )
                return render(request, "chemanager/register.html")

        # Attempt to create new user and return an error if username already taken
        try:
            user = User.objects.create_user(
                username=username, email=email, password=password, laboratory=laboratory
            )
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

        return render(
            request, "chemanager/register.html", {"laboratories": laboratories}
        )


# inventory view
@login_required
def inventory(request, id=None):
    user = request.user

    # get the laboratory id if trying to access URL inventory\laboratory\'id'
    if "laboratory" in request.path:
        lab_id = id

    else:
        # get the laboratory id of the current user
        try:
            lab_id = user.laboratory.id
        except AttributeError:
            lab_id = ""
    
    # get the number of the laboratory
    try:
        lab_number = Laboratory.objects.get(id=id).lab_number
    except ObjectDoesNotExist:
        lab_number = ""

    return render(request, "chemanager/inventory.html", {
        'labId': lab_id,
        'labNumber': lab_number
    })


# register view
@login_required
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
        labs = Laboratory.objects.all().order_by("lab_number")

        # get the total products on the site
        total = 0

        for lab in labs:
            total += lab.count_products()

        response_data = [lab.serialize() for lab in labs]
        return JsonResponse({"laboratories": response_data, "total": total}, status=200)

    else:
        return JsonResponse({"error": "Bad request"}, status=400)


def products(request, id=None):
    """
    Request the database to fetch products list:

    URL: /products/<int:id>
    Method GET: Fetch all products, accept an id to fetch information on a specific product

    URL: /products/laboratory/<int:id>
    Method GET: Fetch all products, accept an id to fetch information on a specific product
    """

    # Check authentifiation
    user = request.user
    path = request.path

    if not user.is_authenticated:
        return JsonResponse({"error": "Authentification required"}, status=401)

    # GET method to fetch datas
    if request.method == "GET":
        try:
            products = query_products(path=path, user=user, id=id)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Ressource not found"}, status=404)

        # serialize the products and store it into response variable
        response = [product.serialize(user) for product in products]

        return JsonResponse({'products': response}, status=200)
    
    # Delete method to delete a specific product
    elif request.method == "DELETE":
        try:
            product = query_products(path=path, id=id)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Ressource not found"}, status=404)
        product.delete()

        return JsonResponse({"message": "Prodcut deleted successfully"}, status=200)
    
    # Edit a product (location, purity, name, ...) or add a product to favorite
    elif request.method == "PUT":

        # if favorite in path: tag the product as a 'favorite'
        if "favorite" in path:
            try:
                product = query_products(path=path, id=id)[0]
            except ObjectDoesNotExist:
                return JsonResponse({"error": "Ressource not found"}, status=404)
            
            if product.is_favorite(user):
                product.favorites.remove(user)
                return JsonResponse({"message": "Product removed from favorite", "action": "unfavorite"}, status=200)
            else:
                product.favorites.add(user)
                return JsonResponse({"message": "Product add to favorite", "action": "favorite"}, status=200)
        
        # update a product
        else:
            pass



        



        

        