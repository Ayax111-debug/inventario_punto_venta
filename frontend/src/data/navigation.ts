import { 
  LayoutDashboard, 
  History, 
  Package, 
  Tags, 
  ShoppingCart 
} from 'lucide-react';

export const NAV_LINKS = [
    { label: 'Ventas', path: '/', icon: LayoutDashboard },
    { label: 'Historial de Ventas', path: '/ventas/historial', icon: History },
    { label: 'Productos', path: '/productos', icon: Package },
    { label: 'Categorias', path: '/categorias', icon: Tags },
    { label: 'Punto de venta', path: '/pos', icon: ShoppingCart },
];