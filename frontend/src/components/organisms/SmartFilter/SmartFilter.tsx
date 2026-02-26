import { useState } from 'react';

// Definimos los tipos de filtros posibles
export type FilterConfig = {
    key: string;           // El nombre del param en la URL (ej: 'activo', 'laboratorio', 'fecha_vencimiento__gte')
    label: string;         // Lo que ve el usuario (ej: 'Estado', 'Lab')
    type: 'text' | 'select' | 'boolean' | 'date'; // Agregamos 'date' para tus rangos de fechas
    options?: { id: string | number, label: string }[]; // Para los selects
};

interface Props {
    config: FilterConfig[];
    onFilterChange: (filters: Record<string, any>) => void;
}

export const SmartFilter = ({ config, onFilterChange }: Props) => {
    // Estado local para acumular filtros
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

    // Manejador genérico de cambios
    const handleChange = (key: string, value: any) => {
        const newFilters = { ...activeFilters, [key]: value };
        
        // Limpiamos claves vacías, nulas o undefined para no ensuciar la URL
        if (value === '' || value === null || value === undefined) {
            delete newFilters[key];
        }
        
        setActiveFilters(newFilters);
        onFilterChange(newFilters); // Avisamos al padre (Page)
    };

    return (
        <div className="bg-slate-50 p-5 rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-300 mb-6">
            <div className="flex flex-wrap gap-4 items-end">
                
                {/* Renderizado Dinámico de Filtros */}
                {config.map((field) => {
                    
                    // CASO 1: Búsqueda de Texto (Input normal)
                    if (field.type === 'text') {
                        return (
                            <div key={field.key} className="w-full md:w-64">
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wide">
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        className="w-full bg-white border border-gray-300 p-2 pl-3 rounded-lg text-sm focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none transition-all"
                                        placeholder={`Buscar...`}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                    />
                                </div>
                            </div>
                        );
                    }

                    // CASO 2: Selectores (Dropdown normal de HTML)
                    if (field.type === 'select') {
                        return (
                            <div key={field.key} className="min-w-[160px]">
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wide">
                                    {field.label}
                                </label>
                                <select 
                                    className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer"
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    {field.options?.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        );
                    }

                    // CASO 3: Booleanos (Sí/No)
                    if (field.type === 'boolean') {
                        return (
                            <div key={field.key} className="min-w-[120px]">
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wide">
                                    {field.label}
                                </label>
                                <select 
                                    className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer"
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                        );
                    }

                    // CASO 4: Fechas (Date Picker nativo)
                    if (field.type === 'date') {
                        return (
                            <div key={field.key} className="min-w-[140px]">
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wide">
                                    {field.label}
                                </label>
                                <input 
                                    type="date"
                                    className="w-full bg-white border border-gray-300 p-2 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                />
                            </div>
                        );
                    }

                    return null;
                })}

                {/* Botón de Limpiar (Solo aparece si hay filtros activos) */}
                
            </div>
            <div className="ml-auto pb-1 mt-2 flex justify-start ">
                     <button 
                        onClick={() => { 
                            // Reseteamos visualmente los inputs (truco rápido: resetear el formulario padre si existiera, o recargar)
                            // En React controlado idealmente pasaríamos 'value' a los inputs, 
                            // pero para mantener este componente simple y desacoplado, solo limpiamos el estado y notificamos.
                            setActiveFilters({}); 
                            onFilterChange({});
                            
                            // Hack visual simple: limpiar los inputs manualmente
                            const inputs = document.querySelectorAll('input, select');
                            inputs.forEach((input: any) => input.value = '');
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors px-3 py-2"
                    >
                        Limpiar Filtros
                    </button>
                </div>
        </div>
    );
};