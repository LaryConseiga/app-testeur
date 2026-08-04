"use client";

import * as React from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { closeApp } from "@/lib/actions/app-actions";

export function CloseAppButton({ appId }: { appId: string }) {
  const [isPending, setIsPending] = React.useState(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Lock />
          Clôturer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clôturer cette demande de test ?</AlertDialogTitle>
          <AlertDialogDescription>
            Plus personne ne pourra soumettre de nouveau rapport de test pour
            cette app. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={async () => {
              setIsPending(true);
              const result = await closeApp(appId);
              if (result?.error) {
                toast.error(result.error);
              }
              setIsPending(false);
            }}
          >
            Clôturer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
