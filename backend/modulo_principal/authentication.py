from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck

def enforce_csrf(request):
    """
    Fuerza la validación CSRF en DRF para esquemas de autenticación personalizados.
    """
    def dummy_get_response(request):
        return None
        
    check = CSRFCheck(dummy_get_response)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied(f'Fallo la validación CSRF: {reason}')


class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        
        header = self.get_header(request)
        if header is None:
            raw_token = request.COOKIES.get(settings.AUTH_COOKIE)  or None
        else: 
            raw_token = self.get_raw_token(header)
        
        if raw_token is None:
            return None
        
        validated_token = self.get_validated_token(raw_token)

        if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            enforce_csrf(request)

        return self.get_user(validated_token), validated_token
    