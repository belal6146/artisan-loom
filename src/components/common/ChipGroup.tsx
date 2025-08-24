// ChipGroup - Selectable chips component
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChipGroupProps {
  options: readonly string[] | string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
  multiple?: boolean;
}

export const ChipGroup = ({
  options,
  selected,
  onChange,
  className,
  multiple = true,
}: ChipGroupProps) => {
  const handleToggle = (option: string) => {
    if (multiple) {
      const newSelected = selected.includes(option)
        ? selected.filter(item => item !== option)
        : [...selected, option];
      onChange(newSelected);
    } else {
      onChange(selected.includes(option) ? [] : [option]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <Button
            key={option}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggle(option)}
            className={cn(
              "h-8 text-xs transition-all",
              isSelected && "bg-primary text-primary-foreground"
            )}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
};