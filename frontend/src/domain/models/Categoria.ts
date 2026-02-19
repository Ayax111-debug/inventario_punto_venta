export interface Categoria {
    id?: number;
    nombre: string;
    descripcion: string; // En Django permite nulos, pero en el front lo manejaremos como string vacío
    activo: boolean;
}