// src/components/templates/POSTemplate.tsx
import React from 'react';
import { MainTemplate } from './MainTemplate'; // Reutilizamos tu layout base (navbar, sidebar)

interface Props {
    scannerArea: React.ReactNode;
    cartArea: React.ReactNode;
    summarySidebar: React.ReactNode;
}

export const POSTemplate = ({ scannerArea, cartArea, summarySidebar }: Props) => {
    return (
        <MainTemplate>
            <div className="flex h-[calc(100vh-64px)] bg-gray-100"> {/* Ajusta altura según tu navbar */}
                {/* Área Principal: Buscador y Tabla (75% ancho) */}
                <div className="w-3/4 p-4 flex flex-col overflow-y-auto">
                    <div className="mb-4 flex-shrink-0">
                        {scannerArea}
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {cartArea}
                    </div>
                </div>
                
                {/* Sidebar Lateral: Totales y Pago (25% ancho) */}
                <div className="w-1/4 bg-white border-l border-gray-200 p-4 shadow-xl flex flex-col">
                    {summarySidebar}
                </div>
            </div>
        </MainTemplate>
    );
};