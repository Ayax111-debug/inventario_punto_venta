import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../../../data/navigation';
import { LogoutButton } from '../../molecules/LogoutBtn';


export const Navbar = () => {
    const [initial, setInitial] = useState("U");
    const [name, setName] = useState("");
    const location = useLocation();

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (username) {
            setInitial(username.charAt(0).toUpperCase());
            setName(username);
        }
    }, []);

    return (
        <aside className="fixed top-4 left-4 bottom-4 w-64 bg-slate-50 text-slate-700 flex flex-col border border-slate-300 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.03)] z-50">
            
            {/* Cabecera del Sidebar */}
            <div className="h-16 flex items-center justify-center border-b border-slate-300">
                <span className="text-xl font-bold text-slate-800 tracking-tight">Mi Sistema POS</span>
            </div>

            {/* Perfil de Usuario */}
            <div className="p-4 flex items-center gap-3 border-b border-slate-300">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-300 flex items-center justify-center text-emerald-600 font-bold shadow-sm">
                    {initial}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">Bienvenido</span>
                    <span className="text-xs text-slate-500 font-medium">{name}</span>
                </div>
            </div>

            {/* Lista de Módulos */}
            <nav className="flex-1 overflow-y-auto py-6">
                <ul className="flex flex-col gap-2 px-3">
                    {NAV_LINKS.map((link) => {
                        const isActive = location.pathname === link.path;
                        // Extraemos el componente del icono si existe
                        const Icon = link.icon;

                        return (
                            <li key={link.path}>
                                <Link
                                    to={link.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        isActive 
                                        ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/20' 
                                        : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900' 
                                    }`}
                                >
                                    {/* Si el icono existe en la constante, lo renderizamos aquí */}
                                    {Icon && <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
                                    
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Pie del Sidebar */}
            <div className="p-4 border-t border-slate-200 flex justify-center pb-6">
                <LogoutButton />
            </div>
        </aside>
    );
};