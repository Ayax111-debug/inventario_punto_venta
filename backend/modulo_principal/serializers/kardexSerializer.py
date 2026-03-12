from rest_framework import serializers
from ..models.kardex import MovimientoKardex

class MovimientoKardexSerializer(serializers.ModelSerializer):
    # Campos calculados para que el frontend reciba strings limpios y no solo IDs
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    
    # get_FOO_display es magia de Django para traer el label legible ('Entrada por Compra' en vez de 'ENTRADA_COMPRA')
    tipo_movimiento_legible = serializers.CharField(source='get_tipo_movimiento_display', read_only=True)

    class Meta:
        model = MovimientoKardex
        fields = [
            'id', 
            'producto', 'producto_nombre', 
            'usuario', 'usuario_nombre',
            'tipo_movimiento', 'tipo_movimiento_legible', 
            'cantidad', 'stock_anterior', 'stock_nuevo', 
            'motivo', 'fecha'
        ]
        
        # Blindaje total: El Kardex entero es de solo lectura. Nadie puede inyectar un POST aquí.
        read_only_fields = fields