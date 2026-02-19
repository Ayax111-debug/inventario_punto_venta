import { type Producto } from '../../../domain/models/Producto';
import { EditButton } from '../../atoms/Button/EditButton';
import { DeleteButton } from '../../atoms/Button/DeleteButton';

interface Props {
    data: Producto[];
    onDelete: (id: number) => void;
    onEdit: (prod: Producto) => void;
}

export const ProductoTable = ({ data, onDelete, onEdit }: Props) => {

    // Helper para formatear dinero (CLP u otra moneda local)
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    if (data.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No hay productos registrados en el inventario.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SKU / Código</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((prod) => (
                            <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                {/* Columna SKU */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                    {prod.codigo_serie}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600'>
                                    {prod.nombre}
                                </td>
                    
                                {/* Columna Precio */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                    {formatPrice(prod.precio_venta)}
                                </td>

                                {/* Columna Estado (Badge) */}
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${prod.activo 
                                            ? 'bg-green-100 text-green-800 border border-green-400' 
                                            : 'bg-red-100 text-red-800'}`
                                    }>
                                        {prod.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>

                                {/* Columna Acciones */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <EditButton className='bg-blue-400 text-white hover:bg-blue-200 m-1 border border-blue-500' onClick={() => (onEdit(prod))}/>

                                    <DeleteButton className='bg-red-400 text-white hover:bg-red-200 border border-red-500'  onClick={() => prod.id && onDelete(prod.id)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};