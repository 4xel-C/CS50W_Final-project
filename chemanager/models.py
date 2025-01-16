from django.contrib.auth.models import AbstractUser
from django.db import models


class Laboratory(models.Model):
    id = models.AutoField(primary_key=True)
    lab_number = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.lab_number

    def count_products(self):
        """
        Give the number of product contained in one laboratory
        """
        boxes = self.boxes.all()
        product_count = 0
        for box in boxes:
            product_count += box.products.count()
        return product_count

    def serialize(self):
        return {
            "id": self.id,
            "labNumber": self.lab_number,
            "productCount": self.count_products(),
        }


# Substorage inside laboratories (boxes)
class Box(models.Model):
    lab = models.ForeignKey(Laboratory, on_delete=models.CASCADE, related_name="boxes")
    box_number = models.CharField(max_length=50)

    def __str__(self):
        return f"Box {self.box_number} in lab {self.lab.lab_number}"


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    laboratory = models.ForeignKey(
        Laboratory, on_delete=models.SET_NULL, null=True, blank=True
    )


class Product(models.Model):
    id = models.AutoField(primary_key=True)
    smile = models.TextField(blank=True, null=True)
    name = models.CharField(max_length=100)
    quantity = models.DecimalField(
        max_digits=10, decimal_places=3, help_text="Quantity available in g"
    )
    purity = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, help_text="in %"
    )
    cas_number = models.CharField(max_length=50, null=True)
    producer = models.CharField(max_length=200, null=True)
    location = models.ForeignKey(
        Box, on_delete=models.SET_NULL, related_name="products", null=True
    )
    creation_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    favorites = models.ManyToManyField(
        User, related_name="favorite_products", blank=True
    )

    # Check if a product is favorite of the current user
    def is_favorite(self, user):
        if not user:
            return False
        return self.favorites.filter(id=user.id).exists()

    def __str__(self):
        return f"{self.name} ({self.cas_number})"

    # Get the laboratory of a specific product
    def get_laboratory(self):
        return self.location.lab

    def serialize(self, user):
        return {
            "id": self.id,
            "smiles": self.smile,
            "name": self.name,
            "quantity": str(self.quantity).rstrip("0").rstrip("."),
            "purity": self.purity,
            "cas": self.cas_number,
            "producer": self.producer,
            "lab": self.location.lab.lab_number if self.location else 'No lab',
            "box": self.location.box_number if self.location else 'unassigned',
            "creationDate": self.creation_date,
            "updateDate": self.update_date,
            "isFavorite": self.is_favorite(user),
        }
