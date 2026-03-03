export interface Categoria {
    id: number;
    nombre: string;
}

export interface Producto {
    id?: number;
    nombre: string;
    descripcion: string;
    codigo_serie: string;
    precio_venta: number;
    stock_actual: number;
    stock_critico: number;
    activo: boolean;
    categoria_id: number | ''; // <-- Nueva pieza clave
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}