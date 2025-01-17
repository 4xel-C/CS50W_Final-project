from django.urls import path
from . import views

urlpatterns = [
    # Views URLs
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("account", views.account, name="account"),
    path("register", views.register, name="register"),
    path("inventory", views.inventory, name="inventory"),
    path("inventory/mylab", views.inventory, name="mylab"),
    path("inventory/laboratory/<int:id>", views.inventory, name="lab_id"),
    path("inventory/add", views.add_product, name="add_product"),
    path("watchlist", views.inventory, name="watchlist"),
    path("detail/<int:id>", views.detail, name="detail"),

    # API URLs
    # Products
    path("site", views.site, name="site"),
    path("products", views.products, name="products"),
    path("products/<int:id>", views.products, name="product_Id"),
    path("products/<int:id>/edit", views.edit_product, name="edit_product"),
    path("products/<int:id>/favorite", views.products, name="product_Id"),
    path("products/laboratory/<int:id>", views.products, name="lab_products"),
    path("products/watchlist", views.products, name="fetch_watchlist"),
    path("products/create", views.create_compound, name="create_comound"),
    
    # Box
    path("box/<int:id>/delete", views.delete_box, name="delete_box"),
    path("box/create", views.create_box, name="create_box"),

    # user
    path("user/me", views.edit_user, name="edit_user"),
    path("user/me/password", views.change_password, name="change_password")
]
