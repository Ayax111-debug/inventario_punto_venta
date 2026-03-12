import * as React from "react"
import { Button, type ButtonProps } from "./Button" // Importa tu botón base
import { cn } from "../../../lib/utils" // Tu utilidad de clases

// Extendemos las props del botón para poder cambiar el texto si queremos
interface AddButtonProps extends ButtonProps {
  label?: string
}

const AddButton = React.forwardRef<HTMLButtonElement, AddButtonProps>(
  ({ label = "Nuevo", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="success" // Usamos la variante que creamos arriba
        size="default"
        // Combinamos tus clases. 'gap-2' separa icono y texto.
        // 'pl-3 pr-4' es un truco visual: un poco menos de padding a la izquierda 
        // equilibra el peso visual del icono.
        className={cn("gap-2 pl-3 pr-4", className)} 
        {...props}
      >
        {/* El Icono SVG optimizado (16px / w-4 h-4) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2} // Un poco más grueso para que se vea nítido en tamaño pequeño
          stroke="currentColor"
          className="size-6 black text-emerald-700" 
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
       

        
        {/* El texto dinámico */}
        <span>{label}</span>
      </Button>
      
    )
  }
)
AddButton.displayName = "AddButton"

export { AddButton }