from django.core.exceptions import ObjectDoesNotExist
from .models import Product

def query_products(path='/products', id=None, favorite=False, key_word=None):
    """
    Function to query the model and return a query set depending of the URL and the get parameters key_word
    """
    # If request product from a specific laboratory from the lab id
    if "laboratory" in path and id:

        # get all the products from a specific lab
        products = Product.objects.filter(location__lab__id=id)

        if not products:
            raise ObjectDoesNotExist
        return products
    
    # elif request for a specific product from his id
    elif id:
        product = Product.objects.get(id=id)
        return product
    
    # return all product if no conditions giveu
    products = Product.objects.all().order_by("name")
    return products
    
    





        

        

