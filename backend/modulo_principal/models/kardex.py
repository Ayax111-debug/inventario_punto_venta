from django.db import models
from django.conf import settings

class MovimientoKardex(models.Model):
    TIPO_MOVIMIENTO = [
        ('INICIAL', 'Carga Inicial de Stock'),
        ('ENTRADA_COMPRA', 'Entrada por Compra'),
        ('SALIDA_VENTA', 'Salida por Venta'),
        ('DEVOLUCION', 'Devolución (Venta Anulada)'),
        ('AJUSTE_POSITIVO', 'Ajuste Manual (Sobrante)'),
        ('AJUSTE_NEGATIVO', 'Ajuste Manual (Merma/Pérdida)'),
    ]

    # Relación segura usando string 'app_name.ModelName'
    producto = models.ForeignKey(
        'modulo_principal.Producto', 
        on_delete=models.CASCADE, 
        related_name='movimientos_kardex'
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT,
        help_text="Quién realizó el movimiento"
    )
    
    tipo_movimiento = models.CharField(max_length=30, choices=TIPO_MOVIMIENTO)
    cantidad = models.PositiveIntegerField()
    stock_anterior = models.PositiveIntegerField()
    stock_nuevo = models.PositiveIntegerField()
    motivo = models.CharField(max_length=255)
    fecha = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Movimiento de Kardex"
        verbose_name_plural = "Movimientos de Kardex"
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.producto.nombre} | {self.tipo_movimiento} | {self.fecha.strftime('%d/%m %H:%M')}"