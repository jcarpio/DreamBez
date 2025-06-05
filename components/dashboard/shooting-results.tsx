"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Download, Camera, Heart, Share2, Copy, Eye, Globe, Lock } from "lucide-react";
import { Icons } from "@/components/shared/icons";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { ShootModal } from "@/components/modals/shoot";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer } from "vaul";
import { toast } from "sonner";
import { useUser } from "@/components/providers/user-provider";

interface Prediction {
    id: string;
    createdAt: string;
    imageUrl: string | null;
    status: string;
    style: string | null;
    pId: string | null;
    prompt?: string | null;
    isShared?: boolean;
    likesCount?: number;
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
        return 'now';
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

export function ShootingResults({ 
    predictions: initialPredictions, 
    studioId, 
    studioStatus, 
    onShootComplete
}: ShootingResultsProps) {
    const { user } = useUser();
    const currentUserId = user?.id || null;
    
    console.log('ShootingResults - user from context:', user);
    console.log('ShootingResults - currentUserId:', currentUserId);
    
    const [predictions, setPredictions] = useState(initialPredictions);
    const [processingPredictions, setProcessingPredictions] = useState<string[]>([]);
    const [hoveredImage, setHoveredImage] = useState<string | null>(null);
    const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
    const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
    const { isMobile } = useMediaQuery();

    const loadUserFavorites = useCallback(async () => {
        if (!currentUserId) return;
        
        try {
            const response = await fetch('/api/favorites', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                const { favorites } = await response.json();
                const favoriteIds = new Set<string>(
                    favorites.map((f: { predictionId: string }) => f.predictionId)
                );
                setLikedImages(favoriteIds);
            }
        } catch (error) {
            console.error("Error loading user favorites:", error);
        }
    }, [currentUserId]);

    useEffect(() => {
        setPredictions(initialPredictions);
        setProcessingPredictions(initialPredictions.filter(p => p.status === "processing").map(p => p.id));
        loadUserFavorites();
    }, [initialPredictions, loadUserFavorites]);

    const handleLike = async (predictionId: string) => {
        if (!currentUserId) {
            toast.error("Please login to like images");
            return;
        }

        if (loadingActions.has(predictionId)) return;

        setLoadingActions(prev => new Set(Array.from(prev).concat([predictionId])));
        
        try {
            const isCurrentlyLiked = likedImages.has(predictionId);
            const method = isCurrentlyLiked ? 'DELETE' : 'POST';
            
            const response = await fetch('/api/favorites', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ predictionId }),
            });

            if (response.ok) {
                const data = await response.json();
                
                setLikedImages(prev => {
                    const newSet = new Set(prev);
                    if (isCurrentlyLiked) {
                        newSet.delete(predictionId);
                        toast.success("Removed from favorites");
                    } else {
                        newSet.add(predictionId);
                        toast.success("Added to favorites");
                    }
                    return newSet;
                });

                setPredictions(prev => 
                    prev.map(p => 
                        p.id === predictionId 
                            ? { ...p, likesCount: data.likesCount }
                            : p
                    )
                );
            } else {
                toast.error("Failed to update favorite status");
            }
        } catch (error) {
            console.error("Error handling like:", error);
            toast.error("Failed to update favorite status");
        } finally {
            setLoadingActions(prev => {
                const newSet = new Set(prev);
                newSet.delete(predictionId);
                return newSet;
            });
        }
    };

    const handleToggleShare = async (predictionId: string) => {
        if (loadingActions.has(predictionId)) return;

        setLoadingActions(prev => new Set(Array.from(prev).concat([predictionId])));
        
        try {
            const prediction = predictions.find(p => p.id === predictionId);
            const newShareStatus = !prediction?.isShared;
            
            const response = await fetch('/api/predictions/share', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    predictionId,
                    isShared: newShareStatus 
                }),
            });

            if (response.ok) {
                setPredictions(prev => 
                    prev.map(p => 
                        p.id === predictionId 
                            ? { ...p, isShared: newShareStatus }
                            : p
                    )
                );
                
                toast.success(newShareStatus ? "Image shared publicly" : "Image made private");
            } else {
                toast.error("Failed to update share status");
            }
        } catch (error) {
            console.error("Error toggling share:", error);
            toast.error("Failed to update share status");
        } finally {
            setLoadingActions(prev => {
                const newSet = new Set(prev);
                newSet.delete(predictionId);
                return newSet;
            });
        }
    };

    const handleShare = async (imageUrl: string, prompt: string | null) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'DreamBez AI Photo Studio',
                    text: prompt || 'Check out this DreamBez AI generated image!',
                    url: imageUrl,
                });
            } catch (error) {
                navigator.clipboard.writeText(imageUrl);
                toast.success("Link copied to clipboard");
            }
        } else {
            navigator.clipboard.writeText(imageUrl);
            toast.success("Link copied to clipboard");
        }
    };

    const handleCopyPrompt = (prompt: string | null | undefined) => {
        if (prompt) {
            navigator.clipboard.writeText(prompt);
            toast.success("Prompt copied to clipboard");
        } else {
            toast.error("No prompt to copy");
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
                            Shooting Results ✨
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {predictions.map((prediction) => {
                                const isLiked = likedImages.has(prediction.id);
                                const isHovered = hoveredImage === prediction.id;
                                const isLoading = loadingActions.has(prediction.id);
                                
                                return (
                                    <div key={prediction.id} className="group relative">
                                        <div 
                                            className="relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-br from-gray-100 to-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-purple-200"
                                            onMouseEnter={() => setHoveredImage(prediction.id)}
                                            onMouseLeave={() => setHoveredImage(null)}
                                        >
                                            {prediction.status === "processing" ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                                                    <div className="text-center">
                                                        <Loader2 className="size-8 animate-spin text-purple-500 mx-auto mb-2" />
                                                        <p className="text-xs text-purple-600 font-medium">Generating...</p>
                                                    </div>
                                                </div>
                                            ) : prediction.imageUrl ? (
                                                <>
                                                    {/* ✅ MODAL PARA VER IMAGEN A GRAN TAMAÑO */}
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
                                                                            Download
                                                                        </Button>
                                                                        <Drawer.Close asChild>
                                                                            <Button variant="outline" size="sm" className="flex-1">
                                                                                Close
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
                                                            <DialogContent className="max-w-4xl p-0 bg-black/95 border-0">
                                                                <DialogTitle className="sr-only">View Image</DialogTitle>
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
                                                                        className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20"
                                                                    >
                                                                        <Download className="mr-2 size-4" />
                                                                        Download
                                                                    </Button>
                                                                    <DialogClose asChild>
                                                                        <Button 
                                                                            variant="secondary" 
                                                                            size="sm"
                                                                            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20"
                                                                        >
                                                                            Close
                                                                        </Button>
                                                                    </DialogClose>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}

                                                    {/* ✅ OVERLAY SIMPLIFICADO - Solo aparece en hover */}
                                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                                                        <div className="absolute top-3 left-3">
                                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(prediction.status)} shadow-lg`} />
                                                        </div>

                                                        {/* ✅ Estado compartido - Solo icono */}
                                                        <div className="absolute top-3 right-3 flex items-center space-x-2">
                                                            <div className={`rounded-full p-1.5 backdrop-blur-sm ${prediction.isShared ? 'bg-green-500/90' : 'bg-gray-500/90'}`}>
                                                                {prediction.isShared ? (
                                                                    <Globe className="w-3 h-3 text-white" />
                                                                ) : (
                                                                    <Lock className="w-3 h-3 text-white" />
                                                                )}
                                                            </div>
                                                            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                                                                {getTimeAgo(prediction.createdAt)}
                                                            </span>
                                                        </div>

                                                        {/* ✅ Contador de likes - Solo si hay likes */}
                                                        {(prediction.likesCount ?? 0) > 0 && (
                                                            <div className="absolute top-3 left-14">
                                                                <div className="bg-red-500/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                                                                    <Heart className="w-3 h-3 fill-white text-white" />
                                                                    <span className="text-white text-xs font-medium">{prediction.likesCount}</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="absolute bottom-3 right-3 flex flex-col space-y-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleShare(prediction.id);
                                                                }}
                                                                disabled={isLoading}
                                                                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
                                                                title={prediction.isShared ? "Make private" : "Share publicly"}
                                                            >
                                                                {isLoading && loadingActions.has(prediction.id) ? (
                                                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                                ) : prediction.isShared ? (
                                                                    <Globe className="w-5 h-5 text-green-400" />
                                                                ) : (
                                                                    <Lock className="w-5 h-5 text-white" />
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleLike(prediction.id);
                                                                }}
                                                                disabled={isLoading}
                                                                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 disabled:opacity-50"
                                                                title="Add to favorites"
                                                            >
                                                                {isLoading && loadingActions.has(prediction.id) ? (
                                                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                                                ) : (
                                                                    <Heart 
                                                                        className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                                                                    />
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleShare(prediction.imageUrl!, prediction.prompt || null);
                                                                }}
                                                                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                                                                title="Share image"
                                                            >
                                                                <Share2 className="w-5 h-5 text-white" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Camera className="size-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* ✅ INFORMACIÓN SIMPLIFICADA DEBAJO DE LA IMAGEN */}
                                        <div className="mt-3 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Badge 
                                                        className="font-medium text-xs px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-0" 
                                                        variant="secondary"
                                                    >
                                                        {prediction.style}
                                                    </Badge>
                                                    
                                                    {/* ✅ Solo contador de likes si hay likes */}
                                                    {(prediction.likesCount ?? 0) > 0 && (
                                                        <span className="text-xs text-gray-500 flex items-center">
                                                            <Heart className="w-3 h-3 mr-1 fill-red-500 text-red-500" />
                                                            {prediction.likesCount}
                                                        </span>
                                                    )}
                                                    
                                                    {/* ✅ Solo icono de estado compartido - SIN TEXTO */}
                                                    <div className="flex items-center">
                                                        {prediction.isShared ? (
                                                            <Globe className="w-3 h-3 text-green-600" title="Public" />
                                                        ) : (
                                                            <Lock className="w-3 h-3 text-gray-500" title="Private" />
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="hidden sm:flex items-center space-x-1">
                                                    <button
                                                        onClick={() => handleLike(prediction.id)}
                                                        disabled={isLoading}
                                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                        title="Add to favorites"
                                                    >
                                                        {isLoading && loadingActions.has(prediction.id) ? (
                                                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                                        ) : (
                                                            <Heart 
                                                                className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                                                            />
                                                        )}
                                                    </button>
                                                    
                                                    {prediction.prompt && (
                                                        <button
                                                            onClick={() => handleCopyPrompt(prediction.prompt)}
                                                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                                            title="Copy prompt"
                                                        >
                                                            <Copy className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleShare(prediction.imageUrl!, prediction.prompt || null)}
                                                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                                        title="Share image"
                                                    >
                                                        <Share2 className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>
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
                    <EmptyPlaceholder.Title>No photos yet</EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description>
                        <br />
                        {studioStatus === "Completed" ? (
                            <>
                                Start a new photo session to generate headshots.
                                <br />
                                <ShootModal studioId={studioId} onShootComplete={onShootComplete} />
                            </>
                        ) : (
                            <>
                                Your studio is processing. In 24 hours it will be ready to help you create your hyper-realistic dreams!
                            </>
                        )}
                    </EmptyPlaceholder.Description>
                </EmptyPlaceholder>
            )}
        </>
    );
}
