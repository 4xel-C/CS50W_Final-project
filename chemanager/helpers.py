from django.core.exceptions import ObjectDoesNotExist
from .models import Product

def query_products(path="/products", user=None, id=None, key_word=None):
    """
    Function to query the model and return a query set depending of the URL and the get parameters key_word
    """
    #  query all products
    if path == "/products":
        products = Product.objects.all().order_by("name")
    
    # query all products from a specific laboratory
    elif "products/laboratory/" in path and id:
        products = Product.objects.filter(location__lab__id=id).order_by("name")
    
    # query for a specific product from his id
    elif "products" in path and id:
        products = Product.objects.filter(id=id).all()
    
    # query for all products in watchlist
    elif "products/watchlist" in path and user:
        products = user.favorite_products.all()

    else:
        raise ObjectDoesNotExist
            
    return products
 
    





        

        

