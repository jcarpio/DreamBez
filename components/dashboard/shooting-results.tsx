"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Download, Camera, Heart, Share2, Copy, Eye } from "lucide-react";
import { Icons } from "@/components/shared/icons";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { ShootModal } from "@/components/modals/shoot";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer } from "vaul";
import { toast } from "sonner";

interface Prediction {
    id: string;
    createdAt: string;
    imageUrl: string | null;
    status: string;
    style: string | null;
    pId: string | null;
    prompt?: string | null;
}

interface ShootingResultsProps {
    predictions: Prediction[];
    studioId: string;
    studioStatus: string;
    onShootComplete: () => void;
}

const downloadImage = async (imageUrl: string) => {
    const response = await fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = imageUrl.split('/').pop() || 'prediction-image.jpg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'completed':
            return 'bg-green-500';
        case 'failed':
            return 'bg-red-500';
        case 'processing':
            return 'bg-yellow-500';
        default:
            return 'bg-gray-500';
    }
};

const getTimeAgo = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'ahora';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d`;
    }
};

export function ShootingResults({ predictions: initialPredictions, studioId, studioStatus, onShootComplete }: ShootingResultsProps) {
    const [predictions, setPredictions] = useState(initialPredictions);
    const [processingPredictions, setProcessingPredictions] = useState<string[]>([]);
    const [hoveredImage, setHoveredImage] = useState<string | null>(null);
    const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
    const { isMobile } = useMediaQuery();

    useEffect(() => {
        setPredictions(initialPredictions);
        setProcessingPredictions(initialPredictions.filter(p => p.status === "processing").map(p => p.id));
    }, [initialPredictions]);

    const handleLike = (predictionId: string) => {
        setLikedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(predictionId)) {
                newSet.delete(predictionId);
                toast.success("Removido de favoritos");
            } else {
                newSet.add(predictionId);
                toast.success("Añadido a favoritos");
            }
            return newSet;
        });
    };

    const handleShare = async (imageUrl: string, prompt: string | null) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'AI Generated Image',
                    text: prompt || 'Check out this AI generated image!',
                    url: imageUrl,
                });
            } catch (error) {
                // Fallback to copy
                navigator.clipboard.writeText(imageUrl);
                toast.success("Link copiado al portapapeles");
            }
        } else {
            navigator.clipboard.writeText(imageUrl);
            toast.success("Link copiado al portapapeles");
        }
    };

    const handleCopyPrompt = (prompt: string | null | undefined) => {
        if (prompt) {
            navigator.clipboard.writeText(prompt);
            toast.success("Prompt copiado al portapapeles");
        } else {
            toast.error("No hay prompt para copiar");
        }
    };

    const fetchPredictionResult = useCallback(async (prediction: Prediction) => {
        try {
            const response = await fetch(`/api/studio/${studioId}/shoot/get-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ predictionDbId: prediction.id, pId: prediction.pId }),
            });
            const data = await response.json();

            if (data.success) {
                setPredictions(prevPredictions =>
                    prevPredictions.map(p =>
                        p.id === prediction.id
                            ? { ...p, status: data.status, imageUrl: data.imageUrl || p.imageUrl }
                            : p
                    )
                );

                if (data.status !== "processing") {
                    setProcessingPredictions(prev => prev.filter(id => id !== prediction.id));
                }
            }
        } catch (error) {
            console.error("Error fetching prediction result:", error);
        }
    }, [studioId]);

    useEffect(() => {
        if (processingPredictions.length === 0) return;

        const interval = setInterval(() => {
            processingPredictions.forEach(id => {
                const prediction = predictions.find(p => p.id === id);
                if (prediction) fetchPredictionResult(prediction);
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [processingPredictions, predictions, fetchPredictionResult]);

    return (
        <>
            {predictions.length > 0 ? (
                <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
                    <CardHeader className="pb-6">
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Resultados del Shooting ✨
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {predictions.map((prediction) => {
                                const isLiked = likedImages.has(prediction.id);
                                const isHovered = hoveredImage === prediction.id;
                                
                                return (
                                    <div key={prediction.id} className="group relative">
                                        {/* Imagen Container */}
                                        <div 
                                            className="relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-br from-gray-100 to-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-purple-200"
                                            onMouseEnter={() => setHoveredImage(prediction.id)}
                                            onMouseLeave={() => setHoveredImage(null)}
                                        >
                                            {prediction.status === "processing" ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                                                    <div className="text-center">
                                                        <Loader2 className="size-8 animate-spin text-purple-500 mx-auto mb-2" />
                                                        <p className="text-xs text-purple-600 font-medium">Generando...</p>
                                                    </div>
                                                </div>
                                            ) : prediction.imageUrl ? (
                                                <>
                                                    {isMobile ? (
                                                        <Drawer.Root>
                                                            <Drawer.Trigger asChild>
                                                                <img
                                                                    src={prediction.imageUrl}
                                                                    alt="Shooting Result"
                                                                    className="absolute inset-0 size-full cursor-pointer object-cover transition-all duration-300"
                                                                />
                                                            </Drawer.Trigger>
                                                            <Drawer.Portal>
                                                                <Drawer.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
                                                                <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mb-10 mt-24 rounded-t-[20px] border bg-white focus:outline-none">
                                                                    <div className="mx-auto my-4 h-1.5 w-12 shrink-0 rounded-full bg-gray-300" />
                                                                    <div className="relative flex h-[70vh] w-full items-center justify-center p-4">
                                                                        <img
                                                                            src={prediction.imageUrl}
                                                                            alt="Shooting Result"
                                                                            className="size-auto max-h-full max-w-full rounded-lg"
                                                                        />
                                                                    </div>
                                                                    <div className="flex justify-center space-x-3 bg-white p-4 border-t">
                                                                        <Button
                                                                            onClick={() => downloadImage(prediction.imageUrl!)}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="flex-1"
                                                                        >
                                                                            <Download className="mr-2 size-4" />
                                                                            Descargar
                                                                        </Button>
                                                                        <Drawer.Close asChild>
                                                                            <Button variant="outline" size="sm" className="flex-1">
                                                                                Cerrar
                                                                            </Button>
                                                                        </Drawer.Close>
                                                                    </div>
                                                                </Drawer.Content>
                                                            </Drawer.Portal>
                                                        </Drawer.Root>
                                                    ) : (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <img
                                                                    src={prediction.imageUrl}
                                                                    alt="Shooting Result"
                                                                    className="absolute inset-0 size-full cursor-pointer object-cover transition-all duration-300"
                                                                />
                                                            </DialogTrigger>
                                                            <DialogTitle></DialogTitle>
                                                            <DialogContent className="max-w-4xl p-0 bg-black/95">
                                                                <div className="relative flex h-[90vh] w-full items-center justify-center p-4">
                                                                    <img
                                                                        src={prediction.imageUrl}
                                                                        alt="Shooting Result"
                                                                        className="size-auto max-h-full max-w-full rounded-lg"
                                                                    />
                                                                </div>
                                                                <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-3 p-4">
                                                                    <Button
                                                                        onClick={() => downloadImage(prediction.imageUrl!)}
                                                                        variant="secondary"
                                                                        size="sm"
                                                                    >
                                                                        <Download className="mr-2 size-4" />
                                                                        Descargar
                                                                    </Button>
                                                                    <DialogClose asChild>
                                                                        <Button variant="secondary" size="sm">
                                                                            Cerrar
                                                                        </Button>
                                                                    </DialogClose>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}

                                                    {/* Overlay con información al hover */}
                                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                                                        {/* Status indicator */}
                                                        <div className="absolute top-3 left-3">
                                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(prediction.status)} shadow-lg`} />
                                                        </div>

                                                        {/* Time ago */}
                                                        <div className="absolute top-3 right-3">
                                                            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                                                                {getTimeAgo(prediction.createdAt)}
                                                            </span>
                                                        </div>

                                                        {/* Acciones estilo Instagram */}
                                                        <div className="absolute bottom-3 right-3 flex flex-col space-y-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleLike(prediction.id);
                                                                }}
                                                                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                                                            >
                                                                <Heart 
                                                                    className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleShare(prediction.imageUrl!, prediction.prompt || null);
                                                                }}
                                                                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                                                            >
                                                                <Share2 className="w-5 h-5 text-white" />
                                                            </button>
                                                        </div>

                                                        {/* Prompt preview */}
                                                        {prediction.prompt && (
                                                            <div className="absolute bottom-3 left-3 max-w-[calc(100%-120px)]">
                                                                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 max-h-20 overflow-hidden">
                                                                    <p className="text-white text-xs leading-tight line-clamp-3">
                                                                        {prediction.prompt}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Camera className="size-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Información inferior rediseñada */}
                                        <div className="mt-3 space-y-3">
                                            {/* Header con style y acciones */}
                                            <div className="flex items-center justify-between">
                                                <Badge 
                                                    className="font-medium text-xs px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-0" 
                                                    variant="secondary"
                                                >
                                                    {prediction.style}
                                                </Badge>
                                                
                                                {/* Acciones compactas para desktop */}
                                                <div className="hidden sm:flex items-center space-x-1">
                                                    <button
                                                        onClick={() => handleLike(prediction.id)}
                                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                                        title="Me gusta"
                                                    >
                                                        <Heart 
                                                            className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                                                        />
                                                    </button>
                                                    
                                                    {prediction.prompt && (
                                                        <button
                                                            onClick={() => handleCopyPrompt(prediction.prompt)}
                                                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                                            title="Copiar prompt"
                                                        >
                                                            <Copy className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleShare(prediction.imageUrl!, prediction.prompt || null)}
                                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                                        title="Compartir"
                                                    >
                                                        <Share2 className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Prompt section mejorada */}
                                            {prediction.prompt && prediction.prompt.trim() !== '' && (
                                                <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-lg p-3 border border-gray-100">
                                                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                                                        {prediction.prompt}
                                                    </p>
                                                    
                                                    {/* Botón copy para móvil */}
                                                    <button 
                                                        onClick={() => handleCopyPrompt(prediction.prompt)}
                                                        className="sm:hidden mt-2 w-full flex items-center justify-center space-x-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                                                    >
                                                        <Copy className="h-3 w-3" /> 
                                                        <span>Copiar Prompt</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <EmptyPlaceholder className="min-h-[80vh]">
                    <EmptyPlaceholder.Icon name="photo" />
                    <EmptyPlaceholder.Title>No hay fotos aún</EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description>
                        <br />
                        {studioStatus === "Completed" ? (
                            <>
                                Inicia una nueva sesión de fotos para generar headshots.
                                <br />
                                <ShootModal studioId={studioId} onShootComplete={onShootComplete} />
                            </>
                        ) : (
                            <>
                                Tu estudio se está procesando. En 24 horas estará listo para ayudarte a crear tus sueños hiper-realistas!
                            </>
                        )}
                    </EmptyPlaceholder.Description>
                </EmptyPlaceholder>
            )}
        </>
    );
}
