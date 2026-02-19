import { useState, useEffect, type FormEvent } from 'react';
import { type Lotes } from '../../../domain/models/Lotes';
import { SearchSelect } from '../../molecules/SearchSelect';
import axios from 'axios';

interface Props {
    onSubmit: (lote: Lotes) => Promise<void>; 
    initialData?: Lotes | null;
    onCancel?: () => void;
}

export const LoteForm = ({ onSubmit, initialData, onCancel }: Props) => {

    const initialState = {
        producto: 0,
        producto_nombre: '',
        codigo_lote: '',
        fecha_creacion: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        cantidad: 0,
        defectuoso: false,
        activo: true
    };

    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- LÓGICA DE BÚSQUEDA ASÍNCRONA ---
    const [searchTerm, setSearchTerm] = useState('');
    const [productOptions, setProductOptions] = useState<{ id: number, nombre: string }[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    
    // Simulación de carga de opciones (Debes conectar tu lógica real aquí)
    // ...

    useEffect(() => {
       if (initialData) {
           setProductOptions([{ id: initialData.producto, nombre: initialData.producto_nombre || '' }]);
           setForm({
               ...initialData,
               fecha_creacion: new Date(initialData.fecha_creacion).toISOString().split('T')[0],
               fecha_vencimiento: new Date(initialData.fecha_vencimiento).toISOString().split('T')[0],
           });
       } else {
           setForm(initialState);
       }
       setErrors({});
    }, [initialData]);
    
    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!form.codigo_lote.trim() || form.producto <= 0) {
            alert("Completa los campos obligatorios");
            return;
        }

        setIsSubmitting(true);
        
        const loteParaEnviar: Lotes = {
            id: initialData?.id,
            producto: form.producto,
            producto_nombre: form.producto_nombre,
            codigo_lote: form.codigo_lote,
            cantidad: form.cantidad,
            defectuoso: form.defectuoso,
            activo: form.activo,
            fecha_creacion: form.fecha_creacion,
            fecha_vencimiento: form.fecha_vencimiento,
        };

        try {
            await onSubmit(loteParaEnviar as unknown as Lotes);
            
            if (!initialData) {
                setForm(initialState);
                setProductOptions([]);
                setSearchTerm('');
            }
            if(onCancel && initialData) onCancel(); 

        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrors(error.response.data);
            } else {
                alert("Ocurrió un error inesperado.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = (fieldName: string) => `
        w-full border p-2 rounded focus:ring-2 outline-none 
        ${errors[fieldName] ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-blue-500'}
    `;

    return (
        <div className="bg-white p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Editar stock' : 'Registrar Nueva carga de stock'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Errores Generales */}
                {errors.non_field_errors && (
                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {errors.non_field_errors[0]}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* SELECT DE PRODUCTO */}
                    <div className="md:col-span-2 relative">
                        <SearchSelect
                            label="Producto *"
                            placeholder={isLoadingProducts ? "Buscando..." : "Escribe para buscar..."}
                            options={productOptions}
                            selectedId={form.producto}
                            onChange={(newId: number) => {
                                const selected = productOptions.find(p => p.id === newId);
                                handleChange('producto', newId);
                                if(selected) handleChange('producto_nombre', selected.nombre);
                            }}
                            onInputChange={(text) => setSearchTerm(text)}
                            disabled={!!initialData}
                        />
                        {errors.producto && <p className="text-red-500 text-xs mt-1">{errors.producto[0]}</p>}
                    </div>

                    {/* CÓDIGO LOTE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código Stock</label>
                        <input
                            className={inputClass('codigo_lote')}
                            value={form.codigo_lote}
                            onChange={e => handleChange('codigo_lote', e.target.value)}
                            required
                        />
                        {errors.codigo_lote && <span className="text-red-500 text-xs font-bold block mt-1">{errors.codigo_lote[0]}</span>}
                    </div>

                    {/* CANTIDAD */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                        <input
                            type="number"
                            min="0"
                            className={inputClass('cantidad')}
                            value={form.cantidad}
                            onChange={e => handleChange('cantidad', Number(e.target.value))}
                            required
                            // Si estamos editando y tiene stock > 0, quizás quieras deshabilitar cambiar la cantidad aquí y forzar ajuste de inventario aparte
                        />
                         {errors.cantidad && <p className="text-red-500 text-xs mt-1">{errors.cantidad[0]}</p>}
                    </div>

                    {/* FECHA ELABORACIÓN */}
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Elaboración</label>
                         <input
                            type="date"
                            className={inputClass('fecha_creacion')}
                            value={form.fecha_creacion}
                            onChange={e => handleChange('fecha_creacion', e.target.value)}
                            required
                         />
                         {errors.fecha_creacion && <span className="text-red-500 text-xs font-bold block mt-1">{errors.fecha_creacion[0]}</span>}
                    </div>

                    {/* FECHA VENCIMIENTO */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento *</label>
                        <input
                            type="date"
                            className={inputClass('fecha_vencimiento')}
                            value={form.fecha_vencimiento}
                            onChange={e => handleChange('fecha_vencimiento', e.target.value)}
                            required
                        />
                        {errors.fecha_vencimiento && <span className="text-red-500 text-xs font-bold block mt-1">{errors.fecha_vencimiento[0]}</span>}
                    </div>
                </div>

                {/* --- NUEVA SECCIÓN DE ESTADOS (CHECKBOXES) --- */}
                <div className="flex flex-wrap gap-6 items-center py-4 border-t border-gray-100 mt-4">
                    
                    {/* Checkbox Activo */}
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none p-2 rounded hover:bg-gray-50 transition">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            checked={form.activo}
                            onChange={e => handleChange('activo', e.target.checked)}
                        />
                        <span className="font-medium">Lote Activo</span>
                    </label>

                    {/* Checkbox Defectuoso */}
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none p-2 rounded hover:bg-red-50 transition">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                            checked={form.defectuoso}
                            onChange={e => handleChange('defectuoso', e.target.checked)}
                        />
                        <span className="font-medium text-red-700">Marcado como Defectuoso</span>
                    </label>
                </div>
                {/* --- FIN SECCIÓN ESTADOS --- */}

                {/* BOTONES */}
                <div className="flex gap-3 justify-end mt-2">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded text-gray-700 hover:bg-gray-200">
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
                    </button>
                </div>
            </form>
        </div>
    );
};