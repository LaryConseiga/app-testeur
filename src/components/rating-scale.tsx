"use client";

import { cn } from "@/lib/utils";

type RatingScaleProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function RatingScale({
  value,
  onChange,
  min = 1,
  max = 5,
}: RatingScaleProps) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="flex gap-1.5" role="radiogroup">
      {values.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          onClick={() => onChange(n)}
          className={cn(
            "flex size-10 items-center justify-center rounded-md border text-sm font-medium transition-colors",
            value === n
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
