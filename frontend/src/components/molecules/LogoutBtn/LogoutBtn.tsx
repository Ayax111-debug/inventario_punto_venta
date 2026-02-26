
import { authService } from "../../../services/auth.service";
import { Button } from "../../atoms/Button";

export const LogoutButton = () =>{
    

    const handleLogout = async () => {
        console.log("1. Click detectado");
        await authService.logout();
        window.location.href='/login'
    };
    return(
        <Button onClick={handleLogout} variant="destructive">
            Cerrar Sesión
        </Button>
    );
};