"use client";

import { useRef, useState } from "react";
import { Camera, Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";

import { Uploader } from "./upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { metroStops } from "@/lib/stops";
import { SuccessDialog } from "@/components/success-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModeToggle } from "./mode-toggle";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function MetroUploadForm() {
    const [category, setCategory] = useState<string>("");
    const [stopName, setStopName] = useState<string>("");
    const [attribution, setAttribution] = useState<string>("");
    const [files, setFiles] = useState<File[]>([]);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
    const [uploadResult, setUploadResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFile([selectedFile]);
        }
    };

    const handleFile = async (selectedFiles: File[]) => {
        const maxFiles = 5;
        if (files.length + selectedFiles.length > maxFiles) {
            setError(`Solo puedes subir hasta ${maxFiles} archivos a la vez`);
            return;
        }

        const processedFiles: File[] = [];
        const maxSize = 5 * 1024 * 1024;

        for (const selectedFile of selectedFiles) {
            if (!selectedFile.type.startsWith("image/")) {
                setError("Solo se permiten archivos de imagen");
                continue;
            }

            if (selectedFile.size > maxSize) {
                try {
                    const compressed = await compressImage(selectedFile);
                    processedFiles.push(compressed);
                } catch (err) {
                    setError("Error al comprimir la imagen");
                    continue;
                }
            } else {
                processedFiles.push(selectedFile);
            }
        }

        setFiles([...files, ...processedFiles]);
        setError(null);
    };

    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    const maxDimension = 2048;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File([blob], file.name, {
                                    type: "image/jpeg",
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                reject(new Error("Compression failed"));
                            }
                        },
                        "image/jpeg",
                        0.85
                    );
                };
            };
            reader.onerror = reject;
        });
    };

    const startCamera = () => {
        return;
    };

    const handleUploadClick = () => {
        if (files.length === 0 || !category || !stopName) {
            setError("Por favor completa todos los campos y selecciona al menos una imagen");
            return;
        }

        if (files.length > 1) {
            setShowConfirmDialog(true);
        } else {
            performUpload();
        }
    };

    const performUpload = async () => {
        setShowConfirmDialog(false);
        setUploadStatus("uploading");
        setError(null);

        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("category", category);
                formData.append("stopName", stopName);
                formData.append("attribution", attribution.trim() || "ANONYMOUS");

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Upload failed");
                }

                return response.json();
            });

            await Promise.all(uploadPromises);
            setUploadStatus("success");
            setShowSuccessDialog(true);

            setTimeout(() => {
                setFiles([]);
                setCategory("");
                setStopName("");
                setAttribution("");
                setUploadStatus("idle");
                setShowSuccessDialog(false);
            }, 3000);
        } catch (err) {
            setUploadStatus("error");
            setError(err instanceof Error ? err.message : "Error al subir el archivo");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">Imágenes metrovalencia</CardTitle>
                        <ModeToggle />
                    </div>
                    <CardDescription>
                        Contribuye al crowdsourcing subiendo imágenes o información de diferentes paradas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría *</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="category" className="w-full">
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NaviLensGo">NaviLens Go</SelectItem>
                                <SelectItem value="Fotos">Foto de Parada</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stop-name">Nombre de Parada *</Label>
                        <Combobox value={stopName} onValueChange={(value) => setStopName(value ?? "")} items={metroStops} autoHighlight>
                            <ComboboxInput
                                id="stop-name"
                                placeholder="Buscar parada..."
                                showClear
                            />
                            <ComboboxContent>
                                <ComboboxEmpty>No se encontró ninguna parada</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                            {item}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="attribution">Nombre</Label>
                        <Input
                            id="attribution"
                            type="text"
                            placeholder="Tu nombre o apodo; se usará para atribuciones"
                            value={attribution}
                            onChange={(e) => setAttribution(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Imagen *</Label>
                        {/*<div className="space-y-3">
                            <div
                                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    Haz clic para subir o arrastra y suelta
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                    PNG, JPG, WEBP
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                capture="environment"
                            />

                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
                                <span className="text-xs text-slate-500">O</span>
                                <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
                            </div>
                        </div>*/}
                        <Uploader onFile={handleFile} />
                        {files.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
                                </p>
                                <div className="grid grid-cols-5 gap-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-800 dark:text-red-200 text-sm">
                            <XCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <Button
                        onClick={handleUploadClick}
                        disabled={uploadStatus === "uploading" || files.length === 0 || !category || !stopName}
                        className="w-full"
                        size="lg"
                    >
                        {uploadStatus === "uploading" ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Subiendo {files.length} imagen{files.length !== 1 ? 'es' : ''}...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Subir {files.length > 0 ? `${files.length} ` : ''}Imagen{files.length !== 1 ? 'es' : ''}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            <SuccessDialog open={showSuccessDialog} setOpen={setShowSuccessDialog} />

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Verifica las imágenes</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de subir {files.length} imágenes. Asegúrate de que todas pertenecen a la misma parada y categoría antes de continuar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={performUpload}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
