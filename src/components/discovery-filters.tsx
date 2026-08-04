"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORM_LABELS } from "@/lib/constants";

type DiscoveryFiltersProps = {
  techStacks: string[];
};

export function DiscoveryFilters({ techStacks }: DiscoveryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select
        defaultValue={searchParams.get("platform") ?? "all"}
        onValueChange={(value) => updateParam("platform", value)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Plateforme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les plateformes</SelectItem>
          {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("tech") ?? "all"}
        onValueChange={(value) => updateParam("tech", value)}
      >
        <SelectTrigger className="w-full sm:w-52">
          <SelectValue placeholder="Stack technique" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les stacks</SelectItem>
          {techStacks.map((tech) => (
            <SelectItem key={tech} value={tech}>
              {tech}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
