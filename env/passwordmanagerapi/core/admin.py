from django.contrib import admin
from .models import CustomerEntity, CustomerKey, CustomerCredentials

# Register your models here.
admin.site.register(CustomerEntity)
admin.site.register(CustomerKey)
admin.site.register(CustomerCredentials)