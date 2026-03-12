// src/domain/models/Venta.ts
import { type Producto } from "./Producto";

// Interfaz para los ítems mientras están en el "carrito" del frontend
export interface CartItem {
    producto: Producto;
    cantidad: number;
    precio_congelado: number; // El precio al momento de agregarlo
    subtotal: number;
}

// Reflejo del modelo DetalleVenta de Django (para lecturas históricas)
export interface DetalleVenta {
    id: number;
    producto: number; // ID del producto
    nombre_producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

// Reflejo del modelo Venta de Django
export interface Venta {
    id: string; // UUID
    fecha: string;
    total: number;
    metodo_pago: 'EFECTIVO' | 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA';
    vendedor_nombre: string;
    anulada: boolean;
    detalles: DetalleVenta[];
}

// Payload para crear una venta (lo que se envía a Django)
// NOTA: Solo enviamos datos esenciales. El backend busca el lote y calcula totales.
export interface CreateVentaPayload {
    metodo_pago: string;
    items: {
        producto_id: number;
        cantidad: number;
    }[];
}