"use client"

import { useState } from "react"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Check } from "lucide-react"

export function SuccessDialog({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia>
                        <Check />
                    </AlertDialogMedia>
                    <AlertDialogTitle>¡Hecho!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Gracias por subir la imagen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogCancel>Cerrar</AlertDialogCancel>
            </AlertDialogContent>
        </AlertDialog>
    )
}
