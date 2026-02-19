import { useState, useEffect, type FormEvent } from 'react';
import { type Categoria } from '../../../domain/models/Categoria';
import axios from 'axios';

interface Props {
    onSubmit: (categoria: Categoria) => Promise<void | any>;
    initialData?: Categoria | null;
    onCancel?: () => void;
}

export const CategoriaForm = ({ onSubmit, initialData, onCancel }: Props) => {

    const initialState: Categoria = {
        nombre: '',
        descripcion: '',
        activo: true,
    };

    const [form, setForm] = useState<Categoria>(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (initialData) {
            setForm({
                ...initialData,
                descripcion: initialData.descripcion || '' // Prevenir nulos en textarea
            });
        } else {
            setForm(initialState);
        }
        setErrors({});
    }, [initialData]);

    const handleChange = (field: keyof Categoria, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({}); 
        setIsSubmitting(true);

        const categoriaParaEnviar: Categoria = {
            ...form,
            id: initialData?.id, 
        };

        try {
            await onSubmit(categoriaParaEnviar);

            if (!initialData) {
                setForm(initialState);
            }
            if (onCancel) onCancel(); 

        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                setErrors(error.response.data); 
            } else {
                alert("Ocurrió un error inesperado al guardar la categoría.");
                console.error(error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = (fieldName: string) => `
        w-full border p-2 rounded focus:ring-2 outline-none transition-colors
        ${errors[fieldName] 
            ? 'border-red-500 ring-red-200 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        }
    `;

    return (
        <div className="bg-white p-6 rounded-sm mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {initialData ? 'Editar Categoría' : 'Registrar Nueva Categoría'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {errors.non_field_errors && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {errors.non_field_errors[0]}
                    </div>
                )}

                {/* CAMPO NOMBRE */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría *</label>
                    <input
                        className={inputClass('nombre')}
                        placeholder="Ej: Periféricos PC"
                        value={form.nombre}
                        onChange={e => handleChange('nombre', e.target.value)}
                        required
                    />
                    {errors.nombre && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.nombre[0]}</span>}
                </div>

                {/* DESCRIPCIÓN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                        className={inputClass('descripcion')}
                        rows={3}
                        placeholder="Detalles sobre los productos de esta categoría..."
                        value={form.descripcion}
                        onChange={e => handleChange('descripcion', e.target.value)}
                    />
                     {errors.descripcion && <span className="text-red-500 text-xs font-bold mt-1 block">{errors.descripcion[0]}</span>}
                </div>

                {/* CHECKBOX ESTADO */}
                <div className="flex gap-6 items-center py-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                            checked={form.activo}
                            onChange={e => handleChange('activo', e.target.checked)}
                        />
                        <span>Categoría Activa</span>
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