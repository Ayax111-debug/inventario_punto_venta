import api from '../api/axios';
import { type Categoria } from '../domain/models/Categoria';

const BASE_URL = '/categorias/'; // Asegúrate de que coincida con tu urls.py de Django

export const categoriaService = {
    getAll: async (page: number = 1, filters: Record<string, any> = {}) => {
        const response = await api.get(BASE_URL, {
            params: {
                page,
                ...filters 
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<Categoria> => {
        const response = await api.get(`${BASE_URL}${id}/`);
        return response.data;
    },

    create: async (categoria: Categoria): Promise<Categoria> => {
        const response = await api.post(BASE_URL, categoria);
        return response.data;
    },

    update: async (id: number, categoria: Categoria): Promise<Categoria> => {
        const response = await api.put(`${BASE_URL}${id}/`, categoria);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`${BASE_URL}${id}/`);
    }
};