import { type ReactNode } from 'react';
import { Navbar } from '../../components/organisms/Navbar';

interface MainTemplateProps {
    children: ReactNode;
}

export const MainTemplate = ({ children }: MainTemplateProps) => {
    return (
        // Fondo verde uniforme y sutil como pediste
        <div className='flex min-h-screen bg-stone-50 relative'>
            
            {/* El Sidebar flotante */}
            <Navbar />
            
            {/* AJUSTE: ml-[18rem] 
                (16rem del ancho del navbar + 1rem del margen izquierdo + 1rem de espacio de respiro)
            */}
            <div className='flex-1 ml-[18rem] flex flex-col'>
                <main className='p-8 max-w-7xl w-full flex-1'>
                    {children}
                </main>
            </div>
        </div>
    );
};