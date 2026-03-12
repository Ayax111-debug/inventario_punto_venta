// src/services/venta.service.ts
import api from '../api/axios';
import {type CreateVentaPayload,type Venta } from '../domain/models/Venta';

export const ventaService = {
    // Registrar una nueva venta
    create: async (payload: CreateVentaPayload): Promise<Venta> => {
        const { data } = await api.post<Venta>('/ventas/', payload);
        return data;
    },

    // Obtener historial (útil para futuros sprints)
    getAll: async (params?: any) => {
        const { data } = await api.get('/ventas/', { params });
        return data;
    }
};