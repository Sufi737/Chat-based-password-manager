from django.db import models
from django.db.models.deletion import CASCADE

# Create your models here.
class CustomerEntity(models.Model):
    username = models.CharField(max_length=30, unique=True)
    firstname = models.CharField(max_length=30)
    lastname = models.CharField(max_length=30)
    password_hash = models.CharField(max_length=65) #this will store SHA256 hashes

class CustomerKey(models.Model):
    customer_id = models.ForeignKey(CustomerEntity, on_delete=CASCADE)
    salt = models.BinaryField(max_length=32)
    for_website = models.CharField(max_length=30)
    website_username = models.CharField(max_length=30)

class CustomerCredentials(models.Model):
    for_website = models.CharField(max_length=30)
    website_username = models.CharField(max_length=30)
    salt_hash = models.BinaryField(max_length=256) #to store PBKDF2HMAC salts
    customer_id = models.ForeignKey(CustomerEntity, on_delete=CASCADE)