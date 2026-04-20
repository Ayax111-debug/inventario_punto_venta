from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from modulo_principal.utils.pagination import EstándarPagination
from modulo_principal.models import Producto, Categoria
from modulo_principal.serializers import ProductoSerializer, CategoriaSerializer
from modulo_principal.services.inventarioservices.categoriaservices import CategoriaService
from modulo_principal.services.inventarioservices.productoservices import ProductoService
from django.http import Http404

class CategoriaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    # DRF requiere queryset para inferir el basename en las rutas, aunque lo sobrescribamos.
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    pagination_class = EstándarPagination
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion']
    filterset_fields = {'activo': ['exact'], 'nombre': ['exact']}
    ordering_fields = ['nombre', 'descripcion']

    def get_queryset(self):
        """Sobrescribe la obtención de la lista completa usando el servicio."""
        return CategoriaService.listar_categorias()

    def get_object(self):
        """Sobrescribe la obtención de una instancia específica (ej. GET /categorias/1/)."""
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        categoria_id = self.kwargs.get(lookup_url_kwarg)
        
        # Uso del método del servicio
        obj = CategoriaService.obtener_categoria_por_id(categoria_id)
        
        if obj is None:
            raise Http404("La categoría no existe.")
            
        # Importante para que DRF evalúe permisos a nivel de objeto si los hay
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_create(self, serializer):
        """Sobrescribe la lógica de guardado en POST para usar el servicio."""
        instancia = CategoriaService.crear_categoria(serializer.validated_data)
        # Asignamos la instancia de vuelta al serializador para la respuesta
        serializer.instance = instancia

    def perform_update(self, serializer):
        """Sobrescribe la lógica de guardado en PUT/PATCH para usar el servicio."""
        instancia = CategoriaService.actualizar_categoria(
            categoria=serializer.instance, 
            datos=serializer.validated_data
        )
        serializer.instance = instancia

    def perform_destroy(self, instance):
        """Sobrescribe la lógica de borrado en DELETE para usar el servicio."""
        CategoriaService.eliminar_categoria(instance)

    @action(detail=False, methods=['get'], url_path='buscar', pagination_class=None)
    def buscar_rapida(self, request):
        """
        Endpoint extra para usar buscar_categorias.
        Ejemplo de uso en React: GET /api/categorias/buscar/?q=medicamento
        """
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response([], status=status.HTTP_200_OK)
            
        resultados = CategoriaService.buscar_categorias(query)
        serializer = self.get_serializer(resultados, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
   


class ProductoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductoSerializer
    pagination_class = EstándarPagination
    
    # Definir queryset aquí ayuda al Router de Django a identificar el modelo
    queryset = Producto.objects.all()
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'codigo_serie', 'descripcion', 'categoria__nombre']
    filterset_fields = {'activo': ['exact'], 'categoria': ['exact']}
    ordering_fields = ['nombre', 'precio_venta', 'stock_actual']

    def get_queryset(self):
        """Usa el servicio para listar con los optimizadores (select_related)."""
        return ProductoService.listar_productos()

    def get_object(self):
        """Usa el servicio para obtener una instancia específica con manejo de 404."""
        pk = self.kwargs.get('pk')
        producto = ProductoService.obtener_producto_por_id(pk)
        if not producto:
            raise Http404("El producto solicitado no existe.")
        self.check_object_permissions(self.request, producto)
        return producto

    def perform_create(self, serializer):
        """Delega la creación al servicio."""
        instancia = ProductoService.crear_producto(serializer.validated_data)
        serializer.instance = instancia

    def perform_update(self, serializer):
        """Delega la actualización al servicio."""
        instancia = ProductoService.actualizar_producto(
            producto=self.get_object(),
            datos=serializer.validated_data
        )
        serializer.instance = instancia

    def destroy(self, request, *args, **kwargs):
        """Usa el servicio para validar y ejecutar la eliminación."""
        producto = self.get_object()
        exito, error_data = ProductoService.puede_eliminar(producto)
        
        if not exito:
            return Response(error_data, status=status.HTTP_400_BAD_REQUEST)
            
        return Response(
            {"mensaje": "Producto eliminado correctamente."}, 
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=False, methods=['get'], pagination_class=None)
    def simple_list(self, request):
        """Retorna una lista ligera para selectores o búsqueda rápida."""
        data = ProductoService.listar_productos_simple()
        return Response(list(data))

    @action(detail=True, methods=['post'], url_path='ajustar-stock')
    def ajustar_stock(self, request, pk=None):
        """Acción personalizada para movimientos de inventario manuales."""
        producto = self.get_object()
        tipo_ajuste = request.data.get('tipo_ajuste')
        cantidad = request.data.get('cantidad')
        motivo = request.data.get('motivo', 'Ajuste manual')

        if not tipo_ajuste or cantidad is None:
            return Response(
                {"error": "Faltan datos obligatorios: tipo_ajuste y cantidad."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            resultado = ProductoService.ajustar_stock(
                producto=producto,
                tipo_ajuste=tipo_ajuste,
                cantidad=cantidad,
                motivo_detalle=motivo,
                usuario=request.user
            )
            return Response(resultado, status=status.HTTP_200_OK)
        except (ValueError, ValidationError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='buscar-pos', pagination_class=None)
    def buscar_para_venta(self, request):
        """Búsqueda optimizada para el punto de venta."""
        query = request.query_params.get('q', '').strip()
        resultados = ProductoService.buscar_para_pos(query)
        return Response(resultados)



