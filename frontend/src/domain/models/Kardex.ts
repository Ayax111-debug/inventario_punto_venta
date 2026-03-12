export interface MovimientoKardex {
    id: number;
    producto: number;
    producto_nombre: string;
    usuario: number;
    usuario_nombre: string;
    tipo_movimiento: string;
    tipo_movimiento_legible: string; // Ej: "Entrada por Compra"
    cantidad: number;
    stock_anterior: number;
    stock_nuevo: number;
    motivo: string;
    fecha: string;
}

export interface KardexFiltros {
    producto?: number;
    tipo_movimiento?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
}