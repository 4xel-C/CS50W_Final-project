from django.urls import path
from . import views

urlpatterns = [

    # Views URLs
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("inventory", views.inventory, name="inventory"),
    path("inventory/mylab", views.inventory, name="mylab"),
    path("inventory/add", views.add_product, name="add_product"),
    path("watchlist", views.inventory, name="watchlist"),

    # API URLs
    path("site", views.site, name="site"),
]
