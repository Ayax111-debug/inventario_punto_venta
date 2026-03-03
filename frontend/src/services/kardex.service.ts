// services/kardexService.ts
import axios from 'axios';
import { type MovimientoKardex, type KardexFiltros } from '../domain/models/Kardex';

// Ajusta tu URL base según tu configuración de entorno
const API_URL = 'http://127.0.0.1:8000/api/kardex/';

export const kardexService = {
    obtenerHistorial: async (filtros: KardexFiltros): Promise<MovimientoKardex[]> => {
        try {
            // Convierte el objeto de filtros a parámetros de URL (ej: ?producto=5)
            const params = new URLSearchParams();
            if (filtros.producto) params.append('producto', filtros.producto.toString());
            if (filtros.tipo_movimiento) params.append('tipo_movimiento', filtros.tipo_movimiento);
            if (filtros.fecha_desde) params.append('fecha__gte', filtros.fecha_desde);
            if (filtros.fecha_hasta) params.append('fecha__lte', filtros.fecha_hasta);

            // Usamos withCredentials si estás manejando JWT por Cookies
            const response = await axios.get(`${API_URL}?${params.toString()}`, {
                withCredentials: true 
            });
            
            // Si tienes paginación de Django, usualmente los datos vienen en response.data.results
            return response.data.results || response.data;
        } catch (error) {
            console.error("Error al obtener el Kardex:", error);
            throw error;
        }
    }
};