from ..models import Producto,Lote,Categoria
from rest_framework import serializers


#-------------------Productos-------------------------


class ProductoSerializer(serializers.ModelSerializer):
    Categoria_nombre = serializers.CharField(source = 'categoria.nombre', read_only=True)
    
    class Meta:
        model = Producto
        fields = '__all__'

#---------------Lotes---------------------
class LoteSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = Lote
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Categoria
        fields = '__all__'
