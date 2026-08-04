"use client";

import * as React from "react";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { markReportUseful } from "@/lib/actions/report-actions";
import { cn } from "@/lib/utils";

export function MarkUsefulButton({
  reportId,
  markedUseful,
}: {
  reportId: string;
  markedUseful: boolean;
}) {
  const [isPending, setIsPending] = React.useState(false);

  return (
    <Button
      type="button"
      variant={markedUseful ? "default" : "outline"}
      size="sm"
      disabled={isPending}
      onClick={async () => {
        setIsPending(true);
        const result = await markReportUseful(reportId);
        if (result?.error) toast.error(result.error);
        setIsPending(false);
      }}
      className={cn(markedUseful && "gap-1.5")}
    >
      <ThumbsUp className={cn("size-3.5", markedUseful && "fill-current")} />
      {markedUseful ? "Marqué utile" : "Marquer utile"}
    </Button>
  );
}
