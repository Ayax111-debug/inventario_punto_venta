from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, Case, When, Value, BooleanField, Sum, F

from ..models import Producto, Lote, Categoria
from ..serializers import (
    ProductoSerializer,
    LoteSerializer,
    CategoriaSerializer
)

# ---------------------------------------------------------
# 1. CATEGORÍAS
# ---------------------------------------------------------
class CategoriaViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    authentication_classes = [] # Corregido el typo aquí

    queryset = Categoria.objects.all() # Faltaba esto! Fundamental para que el ViewSet sepa qué buscar
    serializer_class = CategoriaSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter] # Corregido SerchFilter

    # Quité 'activo' del search porque es booleano, se busca mejor con filterset_fields
    search_fields = ['nombre', 'descripcion'] 

    filterset_fields = {
        'activo': ['exact'],
    }
    ordering_fields = ['nombre', 'descripcion']


# ---------------------------------------------------------
# 2. PRODUCTOS (El cerebro de la operación)
# ---------------------------------------------------------
class ProductoViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] # quitar en produccion
    authentication_classes = [] # quitar en produccion

    serializer_class = ProductoSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Añadimos categoria__nombre para que puedan buscar "Audífonos" y salgan todos
    search_fields = ['nombre', 'codigo_serie', 'descripcion', 'categoria__nombre']
    
    filterset_fields = {
        'activo': ['exact'],
        'categoria': ['exact'], # Permite filtrar por ID de categoría en el frontend
    }
    
    ordering_fields = ['nombre', 'precio_venta']

    def get_queryset(self):
        """
        Smart Sorting:
        1. Prioridad: Productos Activos
        2. Prioridad: Con Stock (Calculado al vuelo)
        3. Alfabético
        """
        # Agregamos select_related('categoria') para optimizar la consulta a la BD
        qs = Producto.objects.select_related('categoria').all()
        
        qs = qs.annotate(
            total_stock_disponible=Sum(
                'lotes__cantidad', 
                filter=Q(lotes__activo=True)
            )
        )
        
        return qs.order_by('-activo', F('total_stock_disponible').desc(nulls_last=True), 'nombre')

    @action(detail=False, methods=['get'], pagination_class=None)
    def simple_list(self, request):
        data = Producto.objects.values('id', 'nombre')
        return Response(list(data))


# ---------------------------------------------------------
# 3. LOTES (Gestión de fechas)
# ---------------------------------------------------------
class LoteViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny] # quitar en produccion
    authentication_classes = [] # quitar en produccion
    
    serializer_class = LoteSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    search_fields = ['codigo_lote', 'producto__nombre']

    filterset_fields = {
        'producto': ['exact'],
        'activo': ['exact'],
        'fecha_vencimiento': ['gte', 'lte'], 
        'fecha_creacion': ['gte', 'lte'],
        'cantidad': ['gte', 'lte'], 
    }

    ordering_fields = ['fecha_vencimiento', 'fecha_creacion', 'cantidad']

    def get_queryset(self):
        return Lote.objects.select_related('producto').order_by(
            '-activo',    
            'fecha_vencimiento' 
        )


# ---------------------------------------------------------
# 4. BUSQUEDA GLOBAL (Optimized)
# ---------------------------------------------------------
class GlobalSearchView(APIView):
    """
    Busca simultáneamente en Productos, Lotes y Categorías.
    """
    permission_classes = [AllowAny] 
    authentication_classes = []

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 3:
            return Response([]) 

        # CATEGORÍAS (Nuevo)
        categorias = Categoria.objects.filter(
            nombre__icontains=query
        ).only('id', 'nombre')[:3]

        # PRODUCTOS
        productos = Producto.objects.filter(
            Q(nombre__icontains=query) | 
            Q(codigo_serie__icontains=query) 
        ).select_related('categoria').only('id', 'nombre', 'codigo_serie', 'precio_venta', 'categoria__nombre')[:3]

        # LOTES
        lotes = Lote.objects.filter(
            codigo_lote__icontains=query
        ).select_related('producto').only('id', 'codigo_lote', 'fecha_vencimiento', 'producto__nombre')[:5]

        data = {
            'categorias': [{
                'id': c.id,
                'titulo': c.nombre,
                'subtitulo': "Categoría",
                'extra': ""
            } for c in categorias],

            'productos': [{
                'id': p.id,
                'titulo': p.nombre,
                'subtitulo': f"Precio: ${p.precio_venta}",
                'extra': p.codigo_serie
            } for p in productos],
            
            'lotes': [{
                'id': l.id,
                'titulo': f"Lote: {l.codigo_lote}",
                'subtitulo': f"Vence: {l.fecha_vencimiento}",
                'extra': l.producto.nombre
            } for l in lotes]
        }

        return Response(data)