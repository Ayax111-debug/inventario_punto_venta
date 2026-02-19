import { useState, useEffect, useCallback } from 'react';
import { type Categoria } from '../../domain/models/Categoria';
import { categoriaService } from '../../services/categoria.service';
import axios from 'axios';

export const useCategorias = (filters: Record<string, any> = {}) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const PAGE_SIZE = 10;

    const filtersString = JSON.stringify(filters);

    const fetchCategorias = useCallback(async (currentPage: number, currentFilters: any) => {
        setLoading(true);
        setGlobalError(null);
        try {
            const data = await categoriaService.getAll(currentPage, currentFilters);
            setCategorias(data.results);
            setTotalPages(Math.ceil(data.count / PAGE_SIZE));
        } catch (err) {
            console.error(err);
            setGlobalError('Error al cargar la lista de categorías');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
    }, [filtersString]);

    useEffect(() => {
        fetchCategorias(page, filters);
    }, [page, filtersString, fetchCategorias]); 

    const crearCategoria = async (cat: Categoria) => {
        try {
            await categoriaService.create(cat);
            await fetchCategorias(page, filters);
            return true;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 400){
                throw err; 
            }
            setGlobalError('Error crítico al crear la categoría');
            throw err;
        }
    };

    const actualizarCategoria = async (id: number, cat: Categoria) => {
        setLoading(true);
        try {
            await categoriaService.update(id, cat);
            await fetchCategorias(page, filters);
            return true;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 400){
                throw err;
            }
            setGlobalError('Error crítico al actualizar la categoría');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const eliminarCategoria = async (id: number) => {
        try {
            await categoriaService.delete(id);
            await fetchCategorias(page, filters);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 403) {
                 alert("No se puede eliminar: Esta categoría está protegida o en uso.");
            } else {
                 setGlobalError('Error al eliminar categoría');
            }
        }
    };

    return {
        categorias,
        loading,
        error: globalError,
        pagination: {
            page,
            totalPages,
            goToPage: (num: number) => setPage(num), 
            hasNext: page < totalPages,
            hasPrev: page > 1,
            nextPage: () => setPage(p => Math.min(p + 1, totalPages)),
            prevPage: () => setPage(p => Math.max(p - 1, 1))
        },
        crearCategoria,
        actualizarCategoria,
        eliminarCategoria,
        refetch: () => fetchCategorias(page, filters)
    };
};