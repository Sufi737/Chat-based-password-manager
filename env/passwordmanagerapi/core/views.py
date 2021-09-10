from types import CellType
from cryptography import fernet
from django.http import JsonResponse, response
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CustomerEntity, CustomerKey, CustomerCredentials
import base64
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.fernet import Fernet
from django.db.models.base import ObjectDoesNotExist
import traceback
import hashlib

#logger configuration
import logging
logging.basicConfig(filename="exceptions.log",
                    format='%(asctime)s %(message)s',
                    filemode='w')
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


class RegisterUser(APIView):
    def post(self, request, *args, **kwargs):
        userInfo = request.data
        existingUser = CustomerEntity.objects.filter(username=userInfo["username"])
        if existingUser:
            response = {
                "status_code": "username_taken",
                "message": "The given username is already taken"
            }
            return Response(response)
        try:
            hash_object = hashlib.sha256(str.encode(userInfo["password"]))
            hex_dig = hash_object.hexdigest()
            newUser = CustomerEntity.objects.create(
                username = userInfo["username"], 
                firstname = userInfo["firstname"],
                lastname = userInfo["lastname"],
                password_hash = hex_dig
            )
            if newUser.id is not None:
                response = {
                        "status_code": "success",
                        "message": "New user created"
                }
            else:
                response = {
                    "status_code": "server_error",
                    "message": "An error occured creating new user"
                }
            return Response(response)
        except Exception as e:
            response = {
                "status_code": "server_error",
                "message": str(e)
            }
            logger.error(str(e))
            return Response(response)

class VerifyUser(APIView):
    def post(self, request, *args, **kwargs):
        userInfo = request.data
        response = {}
        try:
            userObject = CustomerEntity.objects.get(username=userInfo["username"])
            hash_object = hashlib.sha256(str.encode(userInfo["password"]))
            hex_dig = hash_object.hexdigest()
            if userObject.password_hash == hex_dig:
                response["status_code"] = "success"
                response["message"] = "Valid user"
                response["firstname"] = userObject.firstname
                response["lastname"] = userObject.lastname
            else:
                response["status_code"] = "failure"
                response["message"] = "Invalid credentials"

        except ObjectDoesNotExist:
            response["status_code"] = "failure"
            response["message"] = "The given user does not exists"

        except Exception as e:
            response["status_code"] = "failure"
            response["message"] = str(e)
            logger.error(str(e))

        return Response(response)

class NewCreds(APIView):
    def post(self, request, *args, **kwargs):
        userInfo = request.data
        response = {}
        try:
            userObject = CustomerEntity.objects.get(username=userInfo["username"])
            hash_object = hashlib.sha256(str.encode(userInfo["password"]))
            hex_dig = hash_object.hexdigest()
            if userObject.password_hash == hex_dig:
                try:
                    credObject = CustomerCredentials.objects.get(
                        for_website=userInfo["for_website"], 
                        website_username = userInfo["website_username"],
                        customer_id = userObject
                    )
                except Exception as e:
                    credObject = None
                if credObject is not None and credObject.id:
                    response["status_code"] = "duplicate_creds"
                    response["message"] = "Given username and website combination already exists"
                    return Response(response)
                salt = os.urandom(12)
                salt += b'\x0c\xf2\xf8\x16'
                newSalt = CustomerKey.objects.create(
                    customer_id = userObject,
                    salt = salt,
                    for_website = userInfo["for_website"],
                    website_username = userInfo["website_username"]
                )
                if newSalt.id:
                    kdf = PBKDF2HMAC(
                        algorithm=hashes.SHA256(),
                        length=32,
                        salt=salt,
                        iterations=100000
                    )
                    key = base64.urlsafe_b64encode(kdf.derive(str.encode(userInfo["password"])))
                    f = Fernet(key)
                    token = f.encrypt(str.encode(userInfo["website_password"]))
                    newCreds = CustomerCredentials.objects.create(
                        for_website = userInfo["for_website"],
                        website_username = userInfo["website_username"],
                        salt_hash = token,
                        customer_id = userObject
                    )
                    if newCreds.id:
                        response["status_code"] = "success"
                        response["message"] = "Credentials saved successfully"
            else:
                response["status_code"] = "failure"
                response["message"] = "Invalid credentials"

        except Exception as e:
            response["status_code"] = "failure"
            tb = traceback.format_exc()
            response["stacktrace"] = str(tb)
            response["message"] = str(e)
            logger.error(str(e))

        return Response(response)

class GetCreds(APIView):
    def post(self, request, *args, **kwargs):
        userInfo = request.data
        response = {}
        try:
            userObject = CustomerEntity.objects.get(username=userInfo["username"])
            hash_object = hashlib.sha256(str.encode(userInfo["password"]))
            hex_dig = hash_object.hexdigest()
            if userObject.password_hash == hex_dig:
                credObject = CustomerCredentials.objects.get(
                    for_website=userInfo["for_website"], 
                    website_username = userInfo["website_username"],
                    customer_id = userObject
                )
                if credObject.id:
                    salt_record = CustomerKey.objects.get(
                        customer_id = userObject,
                        for_website = userInfo["for_website"],
                        website_username = userInfo["website_username"]
                    )
                    if salt_record.id:
                        kdf2 = PBKDF2HMAC(
                            algorithm=hashes.SHA256(),
                            length=32,
                            salt=salt_record.salt,
                            iterations=100000
                        )
                        key = base64.urlsafe_b64encode(kdf2.derive(str.encode(userInfo["password"])))
                        f = Fernet(key)
                        password = f.decrypt(credObject.salt_hash)
                        if password:
                            response["status_code"] = "success"
                            response["password"] = password

                else:
                    response["status_code"] = "failure"
                    response["message"] = "Cannot find credentials for the given website or username"

        except ObjectDoesNotExist:
            response["status_code"] = "failure"
            response["message"] = "The given user does not exists"

        except Exception as e:
            response["status_code"] = "failure"
            tb = traceback.format_exc()
            response["stacktrace"] = str(tb)
            response["message"] = str(e)
            logger.error(str(e))

        return Response(response)

class GetWebsiteCreds(APIView):
    #returns all credentials for a given website
    def post(self, request, *args, **kwargs):
        userInfo = request.data
        response = {}
        try:
            userObject = CustomerEntity.objects.get(username=userInfo["username"])
            hash_object = hashlib.sha256(str.encode(userInfo["password"]))
            hex_dig = hash_object.hexdigest()
            if userObject.password_hash == hex_dig:
                creds = []
                credential_records = CustomerCredentials.objects.filter(
                    customer_id=userObject,
                    for_website=userInfo["for_website"]
                )
                
                if credential_records:
                    for credential in credential_records:
                        salt_record = CustomerKey.objects.get(
                            customer_id = userObject,
                            for_website = userInfo["for_website"],
                            website_username = credential.website_username
                        )
                        if salt_record.id:
                            kdf2 = PBKDF2HMAC(
                                algorithm=hashes.SHA256(),
                                length=32,
                                salt=salt_record.salt,
                                iterations=100000
                            )
                            key = base64.urlsafe_b64encode(kdf2.derive(str.encode(userInfo["password"])))
                            f = Fernet(key)
                            password = f.decrypt(credential.salt_hash)
                            cred_dict = {
                                "website_username": credential.website_username,
                                "password": password
                            }
                            creds.append(cred_dict)

                    response["status_code"] = "success"
                    response["credentials"] = creds

                else:
                    response["status_code"] = "failure"
                    response["message"] = "Credentials for given website not found"

        except ObjectDoesNotExist:
            response["status_code"] = "failure"
            response["message"] = "The given user does not exists"

        except Exception as e:
            response["status_code"] = "failure"
            tb = traceback.format_exc()
            response["stacktrace"] = str(tb)
            response["message"] = str(e)
            logger.error(str(e))

        return Response(response)