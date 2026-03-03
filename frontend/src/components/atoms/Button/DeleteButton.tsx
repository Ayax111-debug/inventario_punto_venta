import * as React from "react"
import { Button, type ButtonProps } from "./Button" // Importa tu botón base
import { cn } from "../../../lib/utils" // Tu utilidad de clases

// Extendemos las props del botón para poder cambiar el texto si queremos
interface DeleteButtonProps extends ButtonProps {
  label?: string
}

const DeleteButton = React.forwardRef<HTMLButtonElement, DeleteButtonProps>(
  ({ label = "Eliminar", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="destructive" // Usamos la variante que creamos arriba
        size="sm"
        // Combinamos tus clases. 'gap-2' separa icono y texto.
        // 'pl-3 pr-4' es un truco visual: un poco menos de padding a la izquierda 
        // equilibra el peso visual del icono.
        className={cn("gap-2 pl-3 pr-4", className)} 
        {...props}
      >
        {/* El Icono SVG optimizado (16px / w-4 h-4) */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
     <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
    </svg>



       

        
        {/* El texto dinámico */}
        <span>{label}</span>
      </Button>
      
    )
  }
)
DeleteButton.displayName = "DeleteButton"

export { DeleteButton }