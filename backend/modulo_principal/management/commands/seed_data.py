from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker
import random
from datetime import timedelta

# Asegúrate de que la ruta de importación sea la correcta para tu app
from modulo_principal.models import Producto, Lote, Categoria

class Command(BaseCommand):
    help = 'Seed de alto rendimiento para tienda de electrónica (Bulk Create) con Categorías consistentes'

    def handle(self, *args, **kwargs):
        fake = Faker('es_CL')
        self.stdout.write(self.style.WARNING('Iniciando SEED MASIVO (Modo Electrónica v2)...'))

        # Cantidades (ajustables)
        CANT_PRODS = 5000     # 5k productos
        CANT_LOTES = 15000    # 15k lotes 

        with transaction.atomic():
            # ==========================================
            # 1. CATEGORÍAS
            # ==========================================
            self.stdout.write('Generando Categorías maestras...')
            
            # Diccionario que mapea Categorías con los tipos de productos que le corresponden
            mapa_categorias = {
                'Audio y Sonido': ['Audífonos Inalámbricos', 'Audífonos Gamer', 'Parlante Bluetooth', 'Barra de Sonido'],
                'Micrófonos y Streaming': ['Micrófono Condensador', 'Micrófono Corbatero', 'Brazo Articulado para Micrófono'],
                'Periféricos PC': ['Mouse Inalámbrico', 'Mouse Gamer Óptico', 'Teclado Mecánico RGB', 'Teclado Membrana'],
                'Carga y Energía': ['Cargador Carga Rápida 20W', 'Cargador Tipo C', 'Powerbank 10000mAh', 'Powerbank 20000mAh'],
                'Cables y Adaptadores': ['Cable USB-C a USB-C', 'Cable HDMI 2.1', 'Adaptador Hub USB-C', 'Cable de Red Cat6'],
                'Monitores y Pantallas': ['Monitor 24" FHD', 'Monitor Gamer 144Hz', 'Soporte para Monitor Doble'],
                'Almacenamiento': ['Pendrive 64GB', 'Disco Duro Externo 1TB', 'SSD NVMe 500GB', 'MicroSD 128GB'],
                'Redes y Conectividad': ['Router WiFi 6', 'Repetidor de Señal', 'Adaptador Bluetooth USB'],
                'Accesorios Notebook': ['Funda para Notebook', 'Base Refrigerante', 'Candado de Seguridad'],
                'Smart Home': ['Ampolleta Inteligente WiFi', 'Enchufe Inteligente', 'Cámara de Seguridad IP']
            }

            categorias_creadas = {}
            for nombre_cat in mapa_categorias.keys():
                cat, _ = Categoria.objects.get_or_create(
                    nombre=nombre_cat,
                    defaults={'descripcion': f"Productos de la categoría {nombre_cat}"}
                )
                categorias_creadas[nombre_cat] = cat
                
            self.stdout.write(self.style.SUCCESS(f'✓ {len(categorias_creadas)} Categorías creadas.'))

            # ==========================================
            # 2. PRODUCTOS (Electrónica)
            # ==========================================
            self.stdout.write(f'Generando {CANT_PRODS} productos electrónicos en memoria...')
            prods_buffer = []
            
            marcas = ['Sony', 'Logitech', 'JBL', 'Razer', 'Samsung', 'Anker', 'HyperX', 'Corsair', 'Apple', 'Redragon', 'Kingston', 'Tp-Link']

            for _ in range(CANT_PRODS):
                # 1. Elegimos una categoría al azar
                nombre_categoria_elegida = random.choice(list(mapa_categorias.keys()))
                categoria_obj = categorias_creadas[nombre_categoria_elegida]
                
                # 2. Elegimos un producto que pertenezca SOLAMENTE a esa categoría
                tipo_producto = random.choice(mapa_categorias[nombre_categoria_elegida])
                
                # Ejemplo: "Teclado Mecánico RGB Logitech RX-450"
                nombre_prod = f"{tipo_producto} {random.choice(marcas)} {fake.bothify(text='??-###').upper()}"

                prods_buffer.append(
                    Producto(
                        categoria=categoria_obj, # Asignamos la FK de forma consistente
                        nombre=nombre_prod,
                        descripcion=fake.text(max_nb_chars=100),
                        codigo_serie=fake.unique.ean13(), 
                        precio_venta=random.randint(5000, 150000), 
                        activo=True
                    )
                )

            # INSERT MASIVO 1
            Producto.objects.bulk_create(prods_buffer, batch_size=2000)
            self.stdout.write(self.style.SUCCESS('✓ Productos insertados con su categoría correcta.'))

            # Recuperamos los IDs recién creados
            prod_ids = list(Producto.objects.values_list('id', flat=True))

            # ==========================================
            # 3. LOTES
            # ==========================================
            self.stdout.write(f'Generando {CANT_LOTES} lotes en memoria...')
            lotes_buffer = []

            for _ in range(CANT_LOTES):
                prod_id = random.choice(prod_ids)
                fecha_creacion = fake.date_between(start_date='-2y', end_date='today')
                
                dias_garantia = random.randint(365, 1095) 
                fecha_vencimiento = fecha_creacion + timedelta(days=dias_garantia)

                lotes_buffer.append(
                    Lote(
                        producto_id=prod_id,
                        codigo_lote=f"L-{fake.bothify(text='????-####').upper()}",
                        fecha_creacion=fecha_creacion,
                        fecha_vencimiento=fecha_vencimiento,
                        cantidad=random.randint(10, 300), 
                        activo=True
                    )
                )

            # INSERT MASIVO 2
            Lote.objects.bulk_create(lotes_buffer, batch_size=2000)
            self.stdout.write(self.style.SUCCESS('✓ Lotes insertados.'))

        self.stdout.write(self.style.SUCCESS(f'🚀 SEED FINALIZADO: {len(categorias_creadas)} Categorías, {CANT_PRODS} Productos y {CANT_LOTES} Lotes creados con éxito.'))