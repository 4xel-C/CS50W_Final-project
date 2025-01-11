from django.contrib import admin
from .models import User, Laboratory, Box, Product

admin.site.register(User)
admin.site.register(Laboratory)
admin.site.register(Box)
admin.site.register(Product)
