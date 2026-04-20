// frontend/src/services/kardex.service.ts
import api from '../api/axios';
import { type MovimientoKardex, type KardexFiltros } from '../domain/models/Kardex';
import { type PaginatedResponse } from '../components/organisms/Kardex/Kardex';

const BASE_URL = '/kardex/';

export const kardexService = {
    /**
     * Obtiene el historial del Kardex con soporte para paginación y filtros.
     * Al usar nuestra instancia 'api', no necesitamos configurar withCredentials 
     * ni manejar manualmente el token CSRF o la renovación de sesión.
     */
    obtenerHistorial: async (
        filtros: KardexFiltros & { page?: number }
    ): Promise<PaginatedResponse<MovimientoKardex>> => {
        
        // Mapeamos los filtros del dominio a los parámetros esperados por Django (django-filters)
        const params: Record<string, any> = {
            page: filtros.page || 1,
            producto: filtros.producto,
            tipo_movimiento: filtros.tipo_movimiento,
            fecha__gte: filtros.fecha_desde, // El backend espera __gte para 'mayor o igual'
            fecha__lte: filtros.fecha_hasta  // El backend espera __lte para 'menor o igual'
        };

        // Eliminamos parámetros indefinidos o nulos para limpiar la URL
        Object.keys(params).forEach(key => 
            (params[key] === undefined || params[key] === null || params[key] === '') && delete params[key]
        );

        const response = await api.get(BASE_URL, { params });
        
        /**
         * Devolvemos el objeto completo (count, next, previous, results)
         * para que el componente Kardex.tsx pueda manejar la paginación correctamente.
         */
        return response.data;
    }
};