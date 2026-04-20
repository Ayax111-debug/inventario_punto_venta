from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from django.db.models import Sum, Count
from rest_framework.views import APIView
from ..models import SesionCaja
from ..serializers import SesionCajaSerializer
from django.db.models.functions import Coalesce
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated






class CajaActivaView(APIView):
    """
    GET: Devuelve la sesión de caja actualmente abierta (si existe).
    POST: Abre una nueva sesión de caja.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        caja_abierta = SesionCaja.objects.filter(esta_abierta=True).first()
        if caja_abierta:
            serializer = SesionCajaSerializer(caja_abierta)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"mensaje": "No hay caja abierta"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        # 1. Verificar que no haya otra caja abierta
        if SesionCaja.objects.filter(esta_abierta=True).exists():
            return Response(
                {"error": "Ya existe una caja abierta. Debes cerrarla primero."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 2. Crear la nueva caja
        monto_inicial = request.data.get('monto_inicial', 0)
        nueva_caja = SesionCaja.objects.create(
            usuario_apertura=request.user, # Asume que tienes autenticación configurada
            monto_inicial=monto_inicial,
            esta_abierta=True
        )
        
        serializer = SesionCajaSerializer(nueva_caja)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CerrarCajaView(APIView):

    permission_classes = [IsAuthenticated]


    """
    POST: Cierra la sesión de caja actual.
    """
    def post(self, request):
        caja_abierta = SesionCaja.objects.filter(esta_abierta=True).first()
        if not caja_abierta:
            return Response(
                {"error": "No hay ninguna caja abierta para cerrar."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Usamos el método que creamos en el modelo
        caja_abierta.cerrar_caja()
        serializer = SesionCajaSerializer(caja_abierta)
        return Response(serializer.data, status=status.HTTP_200_OK)

class HistorialCajasView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Base del Queryset (Igual que antes)
        cajas = SesionCaja.objects.filter(esta_abierta=False).annotate(
            total_ingresos=Coalesce(Sum('ventas__total'), 0),
            cantidad_ventas=Count('ventas')
        ).order_by('-fecha_apertura')

        # 2. Aplicar Filtros del SmartFilter (Igual que antes)
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        if fecha_desde:
            cajas = cajas.filter(fecha_apertura__date__gte=fecha_desde)
        if fecha_hasta:
            cajas = cajas.filter(fecha_apertura__date__lte=fecha_hasta)

        # 3. 🚀 PAGINACIÓN MÁGICA
        paginator = EstándarPagination()
        page = paginator.paginate_queryset(cajas, request)
        
        if page is not None:
            serializer = SesionCajaSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        # Caso por si no hay paginación
        serializer = SesionCajaSerializer(cajas, many=True)
        return Response(serializer.data)

        

class EstándarPagination(PageNumberPagination):
    page_size = 10 
    page_size_query_param = 'page_size'
    max_page_size = 100