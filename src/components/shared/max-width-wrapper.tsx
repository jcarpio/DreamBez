import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function MaxWidthWrapper({
  className,
  large = false,
  children,
}: {
  className?: string;
  large?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        // Ocupa toda la pantalla en móviles (w-full, sin padding)
        // y aplica márgenes solo en pantallas medianas hacia arriba (md:)
        "w-full px-0 md:px-4",
        large
          ? "md:max-w-screen-2xl md:mx-auto"
          : "md:max-w-6xl md:mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
