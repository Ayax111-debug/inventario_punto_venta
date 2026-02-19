from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import transaction

#--------------------------------------CATEGORIA--------------------------------------
class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Nombre de Categoría")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['nombre']

#--------------------------------------PRODUCTO--------------------------------------
class Producto(models.Model):
    # Relación con Categoría (SET_NULL para que si borras la categoría, el producto no desaparezca)
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="productos"
    )
    
    nombre = models.CharField(max_length=200, db_index=True)
    descripcion = models.TextField(blank=True, verbose_name="Descripción")
    codigo_serie = models.CharField(max_length=13, unique=True, verbose_name="Código de Barras / SKU")
    precio_venta = models.PositiveIntegerField(default=0)
    activo = models.BooleanField(default=True)

    @property
    def stock_total(self):
        # Solo sumamos lotes activos
        return self.lotes.filter(
            activo=True
        ).aggregate(total=models.Sum('cantidad'))['total'] or 0
    
    def __str__(self):
        return f"{self.nombre}"
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_codigo_serie = self.codigo_serie
        
    def clean(self):
        if self.pk and self.lotes.exists():
            errors = {}
            if self.codigo_serie != self._original_codigo_serie:
                errors['codigo_serie'] = "Denegado: Producto con cargas de stock asociadas."
            
            if errors:
                raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def actualizar_estado_basado_en_stock(self):
        tiene_stock = self.lotes.filter(activo=True, cantidad__gt=0).exists()
        
        stock_changed = False
        if not tiene_stock and self.activo:
            self.activo = False
            stock_changed = True
        elif tiene_stock and not self.activo:
            self.activo = True
            stock_changed = True
        
        if stock_changed:
            self.save(update_fields=['activo'])

    class Meta:
        verbose_name = "Producto"
        ordering = ['nombre']

#----------------------------------------------------LOTE------------------------------------------
class LoteManager(models.Manager):
    def delete(self):
        raise PermissionDenied("Borrado masivo deshabilitado por integridad de datos.")

class Lote(models.Model):
    producto = models.ForeignKey(
        Producto, 
        on_delete=models.PROTECT, 
        related_name="lotes" 
    )
    
    codigo_lote = models.CharField(max_length=50, verbose_name="Serie / Lote Fabricante")
    fecha_creacion = models.DateField()
    fecha_vencimiento = models.DateField(db_index=True) 
    cantidad = models.PositiveIntegerField(
        validators=[MinValueValidator(0)], 
        verbose_name="Stock Disponible"
    )
    
    activo = models.BooleanField(default=True, help_text="Estado del lote")

    objects = LoteManager()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_producto_id = self.producto_id
        self._original_codigo_lote = self.codigo_lote
        self._original_fecha_creacion = self.fecha_creacion
        self._original_fecha_vencimiento = self.fecha_vencimiento

    def __str__(self):
        return f"Lote {self.codigo_lote} - {self.producto.nombre}"

    def clean(self):
        if self.pk:
            errors = {}
            if self.producto_id != self._original_producto_id:
                errors['producto_id'] = "Denegado: No puedes cambiar el producto."
            if self.codigo_lote != self._original_codigo_lote:
                errors['codigo_lote'] = "Denegado: No puedes cambiar el código de lote."
            if self.fecha_creacion != self._original_fecha_creacion:
                errors['fecha_creacion'] = "Denegado: No puedes cambiar la fecha de creación."
            if self.fecha_vencimiento != self._original_fecha_vencimiento:
                errors['fecha_vencimiento'] = "Denegado: No puedes cambiar la fecha de vencimiento."

            if errors:
                raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()

        # REGLA: Auto-desactivación si no hay stock
        if self.cantidad == 0:
            self.activo = False
        
        super().save(*args, **kwargs)

        try:
            self.producto.actualizar_estado_basado_en_stock()
        except Exception as e:
            print(f"Error actualizando estado del producto: {e}")

    def delete(self, *args, **kwargs):
        if self.cantidad > 0:
             raise PermissionDenied(
                f"PROTECCIÓN DE STOCK: El lote {self.codigo_lote} tiene {self.cantidad} unidades."
            )
        super().delete(*args, **kwargs)

    class Meta:
        unique_together = ('producto', 'codigo_lote')
        ordering = ['fecha_vencimiento']