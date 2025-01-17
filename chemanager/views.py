from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
import json

from .models import User, Laboratory, Product, Box
from .helpers import query_products, is_valid_cas
from rdkit import Chem


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


# View to display and edit user's informations account
@login_required
def account(request):
    # get the user information
    user = request.user

    # get the laboratory of the user
    user_lab = user.laboratory

    if user_lab:
        user_lab_number = user_lab.lab_number
        user_lab_id = user_lab.id

    # get all laboratory and all boxes
    labs = Laboratory.objects.all()
    boxes = user_lab.boxes.all().order_by('box_number')

    return render(
        request,
        "chemanager/account.html",
        {"user": user, "userLab": user_lab_number, "userLabId": user_lab_id, "labs": labs, "boxes": boxes},
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

    return render(
        request, "chemanager/inventory.html", {"labId": lab_id, "labNumber": lab_number}
    )


# register view
@login_required
def add_product(request):
    user = request.user
    user_lab = user.laboratory

    # Recuperate all the boxes available in the laboratory
    if user_lab:
        boxes = user_lab.boxes.all()

    return render(
        request, "chemanager/add.html", {"user": user, "lab": user_lab, "boxes": boxes}
    )

# detail view
@login_required
def detail(request, id):
    """view rendering the detail of 1 compound, with the possibility of updating the data
    """

    try:
        product = Product.objects.get(id=id)
    except ObjectDoesNotExist:
        messages.error(request, "The product you tried to get does not exist")
        return HttpResponseRedirect(reverse("inventory"))
    
    # Format the quantity and the purity
    quantity = "{:.3f}".format(float(product.quantity)).rstrip('0').rstrip('.')
    purity = "{:.1f}".format(float(product.purity)).rstrip('0').rstrip('.')
    
    return render(request, "chemanager/detail.html", {
        'product': product,
        'quantity': quantity,
        'purity': purity
    })

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
        return JsonResponse({"message": "Bad request"}, status=400)


def products(request, id=None):
    """
    Request the database to fetch products list:

    URL: /products/<int:id>
    Method GET: Fetch all products, accept an id to fetch information on a specific product
    Method DELETE: Delete the corresponding product

    URL: /products/laboratory/<int:id>
    Method GET: Fetch all products, accept an id to fetch information on a specific product
    """

    # Check authentifiation
    user = request.user
    path = request.path

    if not user.is_authenticated:
        return JsonResponse({"message": "Authentification required"}, status=401)

    # GET method to fetch datas
    if request.method == "GET":
        try:
            products = query_products(path=path, user=user, id=id)
        except ObjectDoesNotExist:
            return JsonResponse({"message": "Ressource not found"}, status=404)

        # serialize the products and store it into response variable
        response = [product.serialize(user) for product in products]

        return JsonResponse({"products": response}, status=200)

    # Delete method to delete a specific product
    elif request.method == "DELETE":
        try:
            product = query_products(path=path, id=id)
        except ObjectDoesNotExist:
            return JsonResponse({"message": "Ressource not found"}, status=404)
        product.delete()

        return JsonResponse({"message": "Prodcut deleted successfully"}, status=200)

    # Edit a product to tag it has favorite
    elif request.method == "PUT":
        
        # if favorite in path: tag the product as a 'favorite'
        if "favorite" in path:
            try:
                product = query_products(path=path, id=id)[0]
            except ObjectDoesNotExist:
                return JsonResponse({"message": "Ressource not found"}, status=404)

            if product.is_favorite(user):
                product.favorites.remove(user)
                return JsonResponse(
                    {
                        "message": "Product removed from favorite",
                        "action": "unfavorite",
                    },
                    status=200,
                )
            else:
                product.favorites.add(user)
                return JsonResponse(
                    {"message": "Product added to favorite", "action": "favorite"},
                    status=200,
                )
                
    return JsonResponse({"message": "Bad request"}, status=400)


def create_compound(request):
    """Api route to create a new compound/
    URL: "products/create"
    Methode: "POST"
    Body: name, cas, smile, producer, quantity, purity, laboratory, box
    """
    # check authentification
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({"message": "Need authentication"}, status=401)

    if request.method == "POST":
        # fetch the data from the body
        data = json.loads(request.body)

        # control data => Set to none empty string
        for key in data:
            if data[key].strip() == "":
                data[key] = None

        # control quantity and purity
        try:
            data["quantity"] = float(data["quantity"])
            data["purity"] = float(data["purity"])

            if data["quantity"] <= 0 or not 0 <= data["purity"] <= 100:
                raise ValueError

            # Ensure the number as 3 decimal max for the quantity and 1 for the purity
            data["quantity"] = round(data["quantity"], 3)
            data["purity"] = round(data["purity"], 1)

        except (TypeError, ValueError):
            return JsonResponse(
                {"message": "Quantity or Purity must be a postive number "}, status=400
            )

        # control CAS:
        if data["cas"] and not is_valid_cas(data["cas"]):
            return JsonResponse(
                {"message": "The CAS you entered is invalid"}, status=400
            )

        try:
            # Get the box and laboratory and the box
            laboratory = Laboratory.objects.get(lab_number=data["laboratory"])
            box = laboratory.boxes.get(box_number=data["box"])

        except ObjectDoesNotExist:
            return JsonResponse(
                {"message": "The location you entered does not exist"}, status=400
            )

        # Create the new product in the data base:
        product = Product.objects.create(
            name=data["name"],
            quantity=data["quantity"],
            purity=data["purity"],
            cas_number=data["cas"],
            location=box,
            producer=data["producer"],
            smile=data["smile"],
        )
        product.save()
        return JsonResponse(
                    {"message": "Product successfully created"},
                    status=200,
                )

    else:
        return JsonResponse({"message": "Bad request"}, status=400)


def edit_product(request, id):
    """API route to edit the data of a product
    URL: /products/<int:id>/edit
    Method: PUT
    body component: 'name', 'smile', 'cas', 'producer', 'quantity', 'purity', 'laboratory', 'box'
    """
    # check authentification
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({"message": "Need authentication"}, status=401)
    
    if request.method == "PUT":
        
        # get the corresponding product and new box with error handling:
        try:
            id = int(id)
            product = Product.objects.get(id=id)
        except ValueError:
            return JsonResponse({"message": f"Incorrect product id"}, status=400)
        except ObjectDoesNotExist:
            return JsonResponse({"message": f"No product with id {id} found"}, status=404)
        
        # Get the data and ensure quality
        data = json.loads(request.body)

        
        # Check if a molecule can be generated from the smile if a smile is specified
        if data['smile'] == "None" or not data['smile']:
            data['smile'] = None
        else:
            if Chem.MolFromSmiles(data['smile']) is None:
                return JsonResponse({"message": f"Incorrect Smile code"}, status=400)
            
        if not is_valid_cas(data['cas']):
            return JsonResponse({"message": f"Incorrect cas"}, status=400)
        
        # get the exact location
        try:
            lab = Laboratory.objects.get(lab_number=data['laboratory'])
            box = Box.objects.get(lab=lab ,box_number=data['box'])
        except ObjectDoesNotExist:
            return JsonResponse({"message": "The box location does not exist"}, status=404)
        
        # update the object
        product.name=data['name']
        product.smile=data['smile']
        product.cas_number=data['cas']
        product.producer=data['producer']
        product.quantity=data['quantity']
        product.purity=data['purity']
        product.location=box
        product.save()
        
        return JsonResponse({"message": "Product updated succesfully"}, status=200)
        
    # If wrong method, return error
    return JsonResponse({"message": "Bad request"}, status=400)
    

def delete_box(request, id):
    """API view to delete a box from a laboratory. All products still inside the box are displaced in an 'undefined' box inside the same laboratory.
    
    URL: "/box/<int:id>/delete
    method: "DELETE"
    """
    # check authentification
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({"message": "Need authentication"}, status=401)
    
    if request.method == "DELETE":
        
        # get the corresponding box to delete
        try:
            box_to_delete = Box.objects.get(id=id)
        except ObjectDoesNotExist:
            return JsonResponse({"message": "Box not found"}, status=404)
        
        # get all the products from the current box
        products = box_to_delete.products.all()
        
        # If products, displace all of them in an 'unclassified' box
        if products:
            
            # Get the 'unclassified box' of the same lab 
            unclassified_box, created = Box.objects.get_or_create(box_number='unclassified', lab=box_to_delete.lab )
            
            if unclassified_box == box_to_delete:
                return JsonResponse({"message": "Cannot remove unclassified box if there is still products"}, status=400)
            
            # move all the products
            products.update(location=unclassified_box)        
        
        # delete the box and sent confirmation JsonResponse
        box_to_delete.delete()
        return JsonResponse({"message": "Product deleted successfully"}, status=200)
    
    # If wrong method, return error
    return JsonResponse({"message": "Bad request"}, status=400)


def create_box(request):
    """API route to create a new box in the specified laboratory
    
    URL: "box/create"
    method: "POST"
    body: 'labId', 'boxNumber' 
    """
    # check authentification
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({"message": "Need authentication"}, status=401)
    
    if request.method == "POST":
        # fetch the data from the body
        data = json.loads(request.body)
        
        if not data['labId'] or not data['boxNumber']:
            return JsonResponse({"message": "Bad request"}, status=400)
        try:
            lab_id = int(data['labId'])
            box_number = data['boxNumber']
            if lab_id < 0:
                raise ValueError
        except ValueError:
            return JsonResponse({"message": "Please enter a correct id"}, status=400)
        
        # get the laboratory where to create the box
        try:
            lab = Laboratory.objects.get(id=lab_id)
        except ObjectDoesNotExist:
            return JsonResponse({"message": "laboratory in which the box should be created does not exist"}, status=404)
        
        # create the box and return a positive response
        box = Box.objects.create(lab=lab, box_number=box_number)
        box.save()
        return JsonResponse({"message": "Box successfully created"}, status=200)
        
    # If wrong method, return error
    return JsonResponse({"message": "Bad request"}, status=400)


# ------------------------------------User API
def edit_user(request):
    """
    API view to edit a user informations

    url: "user/me"
    method = "PUT"
    body = key = {username, labNumber, email}
    """
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({"message": "Need authentication"})

    if request.method == "PUT":
        # fetch the data from the body
        data = json.loads(request.body)
        username = data.get("username", user.username)
        lab_number = data.get("labNumber", user.laboratory)
        email = data.get("email", user.email)

        # check email and username:
        if not email or not username:
            return JsonResponse(
                {"message": "Missing required field: email or username"}, status=400
            )

        # get the laboratory instance
        if lab_number == "":
            laboratory = None
        else:
            try:
                laboratory = Laboratory.objects.get(lab_number=lab_number)
            except ObjectDoesNotExist:
                return JsonResponse(
                    {"message": "The laboratory you choose does not exist"}, status=404
                )

        # try to update the database
        try:
            user.username = username
            user.laboratory = laboratory
            user.email = email
            user.save()
            return JsonResponse(
                {"message": "User information successfully updated."}, status=200
            )

        except IntegrityError:
            return JsonResponse({"message": "Username already taken"}, status=409)

    return JsonResponse({"message": "Bad request"}, status=400)


def change_password(request):
    """
    API view to edit a user informations

    url: "user/me"
    method = "PATCH"
    body = key = {password, confirmation}
    """
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({"message": "Need authentication"})

    if request.method == "PATCH":
        # fetch the data from the body
        data = json.loads(request.body)
        password = data.get("newPassword", "")
        old_password = data.get("currentPassword", "")

        if not user.check_password(old_password):
            return JsonResponse({"message": "Wrong old password"}, status=400)
        elif password == "":
            return JsonResponse(
                {"message": "Please enter a correct password"}, status=400
            )

        user.set_password(password)
        user.save()

        # update session to keep the user logged in
        update_session_auth_hash(request, user)

        return JsonResponse({"message": "Password successfully updated."}, status=200)

    else:
        return JsonResponse({"message": "Bad request"}, status=400)
