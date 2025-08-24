// FieldHint - Helper text for form fields
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface FieldHintProps {
  children: React.ReactNode;
  variant?: "default" | "warning" | "error";
  className?: string;
}

export const FieldHint = ({ children, variant = "default", className }: FieldHintProps) => {
  return (
    <div
      className={cn(
        "flex items-start gap-2 text-sm mt-1",
        variant === "default" && "text-muted-foreground",
        variant === "warning" && "text-amber-600 dark:text-amber-400",
        variant === "error" && "text-destructive",
        className
      )}
    >
      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
};