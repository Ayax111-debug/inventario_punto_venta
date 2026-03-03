import React, { useEffect, useState } from 'react';
import {type MovimientoKardex } from '../../../domain/models/Kardex';
import { kardexService } from '../../../services/kardex.service';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    productoId: number | null;
    productoNombre: string;
}

export const KardexModal = ({ isOpen, onClose, productoId, productoNombre }: Props) => {
    const [movimientos, setMovimientos] = useState<MovimientoKardex[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && productoId) {
            cargarKardex(productoId);
        }
    }, [isOpen, productoId]);

    const cargarKardex = async (id: number) => {
        setLoading(true);
        try {
            const data = await kardexService.obtenerHistorial({ producto: id });
            setMovimientos(data);
        } catch (error) {
            console.error("Error cargando Kardex");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            {/* Contenedor principal con estilo Jade POS */}
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header del Modal */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Kardex de Movimientos</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{productoNombre}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-800 transition-colors">
                        ✕
                    </button>
                </div>

                {/* Tabla de Movimientos */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <span className="text-emerald-600 font-bold animate-pulse">Cargando movimientos...</span>
                        </div>
                    ) : movimientos.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            No hay movimientos registrados para este producto.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b-2 border-slate-100">
                                <tr>
                                    <th className="pb-3 px-4">Fecha</th>
                                    <th className="pb-3 px-4">Tipo</th>
                                    <th className="pb-3 px-4">Cant.</th>
                                    <th className="pb-3 px-4">Saldo</th>
                                    <th className="pb-3 px-4">Usuario</th>
                                    <th className="pb-3 px-4">Motivo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {movimientos.map((mov) => {
                                    // Detectar si es entrada o salida para pintar los colores
                                    const isEntrada = mov.tipo_movimiento.includes('ENTRADA') || mov.tipo_movimiento.includes('POSITIVO') || mov.tipo_movimiento.includes('DEVOLUCION');
                                    
                                    return (
                                        <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-3 px-4 text-xs font-mono text-slate-500">
                                                {new Date(mov.fecha).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                                    isEntrada ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {isEntrada ? '⬆ ' : '⬇ '} {mov.tipo_movimiento_legible}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-700">
                                                {isEntrada ? '+' : '-'}{mov.cantidad}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-slate-400 line-through">{mov.stock_anterior}</span>
                                                    <span className="text-[10px] text-slate-300">→</span>
                                                    <span className="text-sm font-black text-emerald-600">{mov.stock_nuevo}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                                                {mov.usuario_nombre}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-slate-500 italic max-w-[200px] truncate" title={mov.motivo}>
                                                {mov.motivo}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};