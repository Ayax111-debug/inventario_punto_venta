import { useState, useEffect, type FormEvent } from 'react';
import { type Producto } from '../../../domain/models/Producto';
// guardamos este import para las futuras categorias: import { SearchSelect } from '../../molecules/SearchSelect';
import axios from 'axios';

interface Props {
    // IMPORTANTE: onSubmit debe lanzar una excepción (reject) si falla la petición HTTP
    onSubmit: (producto: Producto) => Promise<void | any>;
    initialData?: Producto | null;
    onCancel?: () => void;
}

export const ProductoForm = ({ onSubmit, initialData, onCancel }: Props) => {

    const initialState: Producto = {
        nombre: '',
        descripcion: '',
        cantidad_mg: 0,
        cantidad_capsulas: 0,
        es_bioequivalente: false,
        codigo_serie: '',
        precio_venta: 0,
        activo: true,
        stock_total: 0,
    };

    const [form, setForm] = useState<Producto>(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // 1. NUEVO ESTADO DE ERRORES (Igual que en LoteForm)
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        } else {
            setForm(initialState);
        }
        // Limpiamos errores al cambiar entre crear/editar
        setErrors({});
    }, [initialData]);

    // 2. HELPER PARA LIMPIAR ERRORES AL ESCRIBIR
    const handleChange = (field: keyof Producto, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        
        // Si existe un error visual en ese campo, lo borramos
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // 3. HANDLESUBMIT REESTRUCTURADO
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({}); 

        setIsSubmitting(true);

        const productoParaEnviar: Producto = {
            ...form,
            id: initialData?.id, // Aseguramos el ID si es edición
        };

        try {
            // Esperamos que onSubmit lance error si falla el backend
            await onSubmit(productoParaEnviar);

            // ÉXITO
            if (!initialData) {
                setForm(initialState);
            }
            if (onCancel) onCancel(); // Opcional: cerrar modal al guardar

        } catch (error) {
            // CAPTURA DE ERROR AXIOS 400 (Bad Request / Validation Error)
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrors(error.response.data); // Asigna los errores a los inputs
            } else {
                alert("Ocurrió un error inesperado al guardar el producto.");
                console.error(error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper para clases de input (para no repetir código)
    const inputClass = (fieldName: string) => `
        w-full border p-2 rounded focus:ring-2 outline-none 
        ${errors[fieldName] 
            ? 'border-red-500 ring-red-200 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        }
    `;

    return (
        <div className="bg-white p-6 rounded-sm mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* MOSTRAR ERRORES GENERALES (non_field_errors) */}
                {errors.non_field_errors && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {errors.non_field_errors[0]}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* CAMPO NOMBRE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input
                            className={inputClass('nombre')}
                            placeholder="Ej: Audifonos samsung"
                            value={form.nombre}
                            onChange={e => handleChange('nombre', e.target.value)}
                            required
                        />
                        {errors.nombre && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.nombre[0]}</span>}
                    </div>

                    {/* CAMPO CÓDIGO SERIE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Código Barra *</label>
                        <input
                            className={inputClass('codigo_serie')}
                            placeholder="Ej: 78000123"
                            value={form.codigo_serie}
                            onChange={e => handleChange('codigo_serie', e.target.value)}
                            required
                        />
                         {errors.codigo_serie && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.codigo_serie[0]}</span>}
                    </div>

                   

                    {/* PRECIO VENTA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta *</label>
                        <input
                            type="number"
                            min="0"
                            className={inputClass('precio_venta')}
                            value={form.precio_venta || ''}
                            onChange={e => handleChange('precio_venta', Number(e.target.value))}
                            required
                        />
                        {errors.precio_venta && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.precio_venta[0]}</span>}
                    </div>

                    {/* DOSIS (MG) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosis (mg) *</label>
                        <input
                            type="number"
                            min="1"
                            className={inputClass('cantidad_mg')}
                            value={form.cantidad_mg || ''}
                            onChange={e => handleChange('cantidad_mg', Number(e.target.value))}
                            required
                        />
                         {errors.cantidad_mg && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.cantidad_mg[0]}</span>}
                    </div>

                    {/* CANTIDAD CÁPSULAS */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cápsulas/Unidades</label>
                        <input
                            type="number"
                            min="1"
                            className={inputClass('cantidad_capsulas')}
                            value={form.cantidad_capsulas || ''}
                            onChange={e => handleChange('cantidad_capsulas', Number(e.target.value))}
                        />
                        {errors.cantidad_capsulas && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.cantidad_capsulas[0]}</span>}
                    </div>
                </div>

                {/* DESCRIPCIÓN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Componente Activo / Descripción</label>
                    <textarea
                        className={inputClass('descripcion')}
                        rows={2}
                        value={form.descripcion}
                        onChange={e => handleChange('descripcion', e.target.value)}
                    />
                     {errors.descripcion && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.descripcion[0]}</span>}
                </div>

                {/* CHECKBOXES */}
                <div className="flex gap-6 items-center py-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            checked={form.es_bioequivalente}
                            onChange={e => handleChange('es_bioequivalente', e.target.checked)}
                        />
                        <span>Es Bioequivalente</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                            checked={form.activo}
                            onChange={e => handleChange('activo', e.target.checked)}
                        />
                        <span>Producto Activo</span>
                    </label>
                </div>

                {/* BOTONES */}
                <div className="flex gap-3 justify-end mt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={() => { setForm(initialState); setErrors({}); onCancel(); }}
                            className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2 rounded font-medium text-white transition
                            ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                        `}
                    >
                        {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
                    </button>
                </div>
            </form>
        </div>
    );
};