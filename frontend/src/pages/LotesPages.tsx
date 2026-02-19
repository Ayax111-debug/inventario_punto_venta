import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { useLotes } from '../hooks/inventario/useLotes';
import { LoteForm } from '../components/organisms/Lotes/LoteForm';
import { LoteTable } from '../components/organisms/Lotes/LoteTable';
import { MainTemplate } from '../components/templates/MainTemplate';
import { Modal } from '../components/molecules/Modal';
import { Paginator } from '../components/molecules/Paginator';
import { SmartFilter, type FilterConfig } from '../components/organisms/SmartFilter/SmartFilter'; 
import { loteService } from '../services/lotes.service'; 
import { AddButton } from '../components/atoms/Button/AddButton';
import { useProductoSelect } from '../hooks/inventario/useProductoSelect';
import { type Lotes } from '../domain/models/Lotes';

const LotesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. ESTADO PARA FILTROS
    const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});

    // 2. HOOK CON FILTROS
    const { 
        lotes, 
        loading, 
        error, 
        pagination, 
        crearLote, 
        eliminarLote, 
        actualizarLote 
    } = useLotes(currentFilters); 

    const { productos } = useProductoSelect(); 

    // Estados del modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLote, setEditingLote] = useState<Lotes | null>(null);
    const [fetchingSingle, setFetchingSingle] = useState(false);

    // ---------------------------------------------
    // 3. CONFIGURACIÓN DEL SMART FILTER
    // ---------------------------------------------
    const filterConfig: FilterConfig[] = useMemo(() => [
        { 
            key: 'search', 
            label: 'Buscar (Cód/Prod)', 
            type: 'text' 
        },
        { 
            key: 'activo', 
            label: 'Estado', 
            type: 'boolean' 
        },
        { 
            key: 'defectuoso', 
            label: 'Defectuosos', 
            type: 'boolean' 
        },
        // Eliminamos el campo de producto para simplificar la UX
        {
            key: 'fecha_vencimiento__gte', 
            label: 'Vence Desde',
            type: 'date' 
        },
        {
            key: 'fecha_vencimiento__lte', 
            label: 'Vence Hasta',
            type: 'date'
        }
    ], []);

    // Handler de filtros
    const handleFilterChange = (newFilters: Record<string, any>) => {
        setCurrentFilters(newFilters);
        pagination.goToPage(1); 
    };

    // ---------------------------------------------
    // LÓGICA DE URL Y MODAL
    // ---------------------------------------------
    useEffect(() => {
        const editId = searchParams.get('editar');
        if (!editId) return;

        const idToFind = Number(editId);
        const loteEnLista = lotes.find(l => l.id === idToFind);

        if (loteEnLista) {
            setEditingLote(loteEnLista);
            setIsModalOpen(true);
        } else {
            setFetchingSingle(true);
            loteService.getById(idToFind)
                .then((lote) => {
                    setEditingLote(lote);
                    setIsModalOpen(true);
                })
                .catch(() => setSearchParams({}))
                .finally(() => setFetchingSingle(false));
        }
    }, [searchParams]); // Eliminamos 'lotes' de dependencias para evitar loop si cambia la lista

    const handleCreate = () => {
        setEditingLote(null);
        setIsModalOpen(true);
        setSearchParams({});
    };

    const handleEdit = (lote: Lotes) => {
        if (!lote.id) return;
        setEditingLote(lote);
        setIsModalOpen(true);
        setSearchParams({ editar: lote.id.toString() });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLote(null);
        setSearchParams({});
    };

    const handleSubmit = async (formData: Lotes) => {
        if (editingLote?.id) {
            await actualizarLote(editingLote.id, formData);
        } else {
            await crearLote(formData);
        }
        handleCloseModal();
    };

    // ---------------------------------------------
    // RENDER
    // ---------------------------------------------
    return (
        <MainTemplate>
            <div className="max-w-6xl mx-auto p-6">
                
                {/* Header */}
                <div className="flex bg-white p-5 rounded-sm shadow-md justify-between items-center mb-6 ">
                    <h1 className="text-3xl font-bold text-gray-700">STOCK GENERAL DE PRODUCTOS</h1>
                    <AddButton label='Agregar nuevo stock' onClick={handleCreate}/>
                </div>

                {/* --- SMART FILTER --- */}
                <SmartFilter 
                    config={filterConfig} 
                    onFilterChange={handleFilterChange} 
                />

                {/* Feedback Error */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 mb-6 rounded border border-red-200">
                        {error}
                    </div>
                )}

                {/* Tabla */}
                {loading && lotes.length === 0 ? (
                   <div className="p-10 text-center text-gray-500 animate-pulse">Cargando inventario...</div>
                ) : (
                    <>
                        <LoteTable 
                            data={lotes} 
                            onDelete={eliminarLote}
                            onEdit={handleEdit}
                        />
                        <div className="mt-4">
                            <Paginator 
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onNext={pagination.nextPage}
                                onPrev={pagination.prevPage}
                                hasNext={pagination.hasNext}
                                hasPrev={pagination.hasPrev}
                            />
                        </div>
                    </>
                )}

                {/* Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={editingLote ? "Editar Stock" : "Nuevo Stock"}
                >
                    {fetchingSingle ? (
                        <div className="flex flex-col items-center justify-center p-8">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <LoteForm 
                            onSubmit={handleSubmit}
                            initialData={editingLote}
                            onCancel={handleCloseModal}
                        />
                    )}
                </Modal>
            </div>
        </MainTemplate>
    );
};

export default LotesPage;