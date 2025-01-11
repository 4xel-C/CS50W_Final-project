from django.contrib.auth.models import AbstractUser
from django.db import models


class Laboratory(models.Model):
    id = models.AutoField(primary_key=True)
    lab_number = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.lab_number

class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    laboratory = models.ForeignKey(
        Laboratory, on_delete=models.SET_NULL, null=True, blank=True
    )