 "use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Download, Camera, Clipboard } from "lucide-react";
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
    studioStatus: string;  // Ensure we accept studioStatus prop
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
            return 'bg-green-300 border-green-400';
        case 'failed':
            return 'bg-red-300 border-red-400';
        case 'processing':
            return 'bg-gray-300 border-gray-400';
        default:
            return 'bg-yellow-200 border-yellow-300';
    }
};

const getTimeAgo = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    }
};


export function ShootingResults({ predictions: initialPredictions, studioId, studioStatus, onShootComplete }: ShootingResultsProps) {
    const [predictions, setPredictions] = useState(initialPredictions);
    const [processingPredictions, setProcessingPredictions] = useState<string[]>([]);
    const { isMobile } = useMediaQuery();

    useEffect(() => {
        setPredictions(initialPredictions);
        setProcessingPredictions(initialPredictions.filter(p => p.status === "processing").map(p => p.id));
    }, [initialPredictions]);

    const handleCopy = (prompt: string | null | undefined) => {
        if (prompt) {
            navigator.clipboard.writeText(prompt);
            toast.success("Prompt copied to clipboard!");
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
                <Card>
                    <CardHeader>
                        <CardTitle>Shooting results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {predictions.map((prediction) => (
                                <div key={prediction.id} className="space-y-2">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
                                        {prediction.status === "processing" ? (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader2 className="size-8 animate-spin" />
                                            </div>
                                        ) : prediction.imageUrl ? (
                                            isMobile ? (
                                                <Drawer.Root>
                                                    <Drawer.Trigger asChild>
                                                        <img
                                                            src={prediction.imageUrl}
                                                            alt="Shooting Result"
                                                            className="absolute inset-0 size-full cursor-pointer object-cover transition-all duration-300 hover:scale-105"
                                                        />
                                                    </Drawer.Trigger>
                                                    <Drawer.Portal>
                                                        <Drawer.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
                                                        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mb-10 mt-24 rounded-t-[10px] border bg-background focus:outline-none">
                                                            <div className="mx-auto my-4 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
                                                            <div className="relative flex h-[70vh] w-full items-center justify-center p-4">
                                                                <img
                                                                    src={prediction.imageUrl}
                                                                    alt="Shooting Result"
                                                                    className="size-auto max-h-full max-w-full"
                                                                />
                                                            </div>
                                                            <div className="flex justify-end space-x-2 bg-background p-4">
                                                                <Button
                                                                    onClick={() => downloadImage(prediction.imageUrl!)}
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Download className="mr-2 size-4" />
                                                                    Download
                                                                </Button>
                                                                <a
                                                                    href={prediction.imageUrl || '#'}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                                                >
                                                                    Open in new Tab
                                                                </a>
                                                                <Drawer.Close asChild>
                                                                    <Button variant="outline" size="sm">Close</Button>
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
                                                            className="absolute inset-0 size-full cursor-pointer object-cover transition-all duration-300 hover:scale-105"
                                                        />
                                                    </DialogTrigger>
                                                    <DialogTitle></DialogTitle>
                                                    <DialogContent className="flex overflow-hidden pr-6 lg:p-0">
                                                        <div className="relative flex h-[90vh] w-[90vw] items-center justify-center p-4">
                                                            <img
                                                                src={prediction.imageUrl}
                                                                alt="Shooting Result"
                                                                className="size-auto max-h-full max-w-full"
                                                            />
                                                        </div>
                                                        <div className="absolute inset-x-0 bottom-10 flex justify-end space-x-2 bg-background p-4 lg:bottom-0">
                                                            <Button
                                                                onClick={() => downloadImage(prediction.imageUrl!)}
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Download className="mr-2 size-4" />
                                                                Download
                                                            </Button>
                                                            <DialogClose asChild>
                                                                <Button variant="outline" size="sm">Close</Button>
                                                            </DialogClose>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Camera className="size-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1 text-xs">
                                      <div className="flex items-center justify-between">
                                        <Badge className="font-urban text-xs" variant="secondary">
                                          {prediction.style}
                                        </Badge>
                                        <span className="hidden items-center gap-1 text-muted-foreground sm:flex">
                                          <span className={`border-1 inline-block size-2 rounded-full ${getStatusColor(prediction.status)}`} title={prediction.status} />
                                          {getTimeAgo(prediction.createdAt)}
                                        </span>
                                      </div>
                                    
                                      {prediction.prompt && (
                                        <div className="flex flex-col gap-1 pt-2">
                                          <p className="text-xs text-muted-foreground break-words">{prediction.prompt}</p>
                                          <Button variant="outline" size="sm" onClick={() => handleCopy(prediction.prompt)}>
                                            <Clipboard className="mr-1 h-3 w-3" /> Copy Prompt
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <EmptyPlaceholder className="min-h-[80vh]">
                    <EmptyPlaceholder.Icon name="photo" />
                    <EmptyPlaceholder.Title>No Headshots yet</EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description><br></br>
                        {studioStatus === "Completed" ? (
                            <>
                                Start a new photo shoot for headshots.<br></br>
                                <ShootModal studioId={studioId} onShootComplete={onShootComplete} />
                            </>
                        ) : (
                            <>
                                Your studio is being processed. In 24 hours, it will be ready to help you create your hyper-realistic dreams!
                            </>
                        )}
                    </EmptyPlaceholder.Description>
                </EmptyPlaceholder>
            )}
        </>
    );
}

/*

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Download, Camera } from "lucide-react";
import { Icons } from "@/components/shared/icons";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { ShootModal } from "@/components/modals/shoot";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer } from "vaul";

interface Prediction {
    id: string;
    createdAt: string;
    imageUrl: string | null;
    status: string;
    style: string | null;
    pId: string | null;
}

interface ShootingResultsProps {
    predictions: Prediction[];
    studioId: string;
    studioStatus: string;  // Ensure we accept studioStatus prop
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
            return 'bg-green-300 border-green-400';
        case 'failed':
            return 'bg-red-300 border-red-400';
        case 'processing':
            return 'bg-gray-300 border-gray-400';
        default:
            return 'bg-yellow-200 border-yellow-300';
    }
};

const getTimeAgo = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    }
};

export function ShootingResults({ predictions: initialPredictions, studioId, studioStatus, onShootComplete }: ShootingResultsProps) {
    const [predictions, setPredictions] = useState(initialPredictions);
    const [processingPredictions, setProcessingPredictions] = useState<string[]>([]);
    const { isMobile } = useMediaQuery();

    // Function to upload to R2
    const uploadToR2 = useCallback(async (imageUrl: string) => {
        const response = await fetch(imageUrl);
        const imageBlob = await response.blob();

        const formData = new FormData();
        const fileName = `${studioId}-${Date.now()}.jpg`;
        formData.append('file', new File([imageBlob], fileName, { type: 'image/jpeg' }));

        const uploadResponse = await fetch('/api/studio/upload', {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to R2');
        }

        const { url } = await uploadResponse.json();
        return url;  // URL pública de la imagen almacenada en R2
    }, [studioId]);  // Make studioId a dependency since it's used inside the callback

    // Modified function to fetch prediction result and update the image URL
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

            if (data.success && data.imageUrl) {
                // Upload image to R2 and get the new URL
                const r2ImageUrl = await uploadToR2(data.imageUrl);

                // Update the URL in the database
                await fetch(`/api/studio/${studioId}/update-image`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        predictionId: prediction.id,
                        imageUrl: r2ImageUrl
                    })
                });

                // Update the image in the local state with the new R2 URL
                setPredictions(prevPredictions =>
                    prevPredictions.map(p =>
                        p.id === prediction.id
                            ? { ...p, status: data.status, imageUrl: r2ImageUrl }
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
    }, [studioId, uploadToR2]);  // Ensure uploadToR2 is in the dependency array

    // useEffect to poll for processing predictions
    useEffect(() => {
        if (processingPredictions.length === 0) return;

        const interval = setInterval(() => {
            processingPredictions.forEach(id => {
                const prediction = predictions.find(p => p.id === id);
                if (prediction) fetchPredictionResult(prediction);
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [processingPredictions, predictions, fetchPredictionResult]);  // Keep fetchPredictionResult as a dependency

    return (
        <>
            {predictions.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Shooting results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {predictions.map((prediction) => (
                                <div key={prediction.id} className="space-y-2">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
                                        {prediction.status === "processing" ? (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader2 className="size-8 animate-spin" />
                                            </div>
                                        ) : prediction.imageUrl ? (
                                            isMobile ? (
                                                <Drawer.Root>
                                                    <Drawer.Trigger asChild>
                                                        <img
                                                            src={prediction.imageUrl}
                                                            alt="Shooting Result"
                                                            className="absolute inset-0 size-full cursor-pointer object-cover transition-all duration-300 hover:scale-105"
                                                        />
                                                    </Drawer.Trigger>
                                                    <Drawer.Portal>
                                                        <Drawer.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
                                                        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mb-10 mt-24 rounded-t-[10px] border bg-background focus:outline-none">
                                                            <div className="mx-auto my-4 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
                                                            <div className="relative flex h-[70vh] w-full items-center justify-center p-4">
                                                                <img
                                                                    src={prediction.imageUrl}
                                                                    alt="Shooting Result"
                                                                    className="size-auto max-h-full max-w-full"
                                                                />
                                                            </div>
                                                            <div className="flex justify-end space-x-2 bg-background p-4">
                                                                <Button
                                                                    onClick={() => downloadImage(prediction.imageUrl!)}
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Download className="mr-2 size-4" />
                                                                    Download
                                                                </Button>
                                                                <a
                                                                    href={prediction.imageUrl || '#'}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                                                >
                                                                    Open in new Tab
                                                                </a>
                                                                <Drawer.Close asChild>
                                                                    <Button variant="outline" size="sm">Close</Button>
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
                                                            className="absolute inset-0 size-full cursor-pointer object-cover transition-all duration-300 hover:scale-105"
                                                        />
                                                    </DialogTrigger>
                                                    <DialogTitle></DialogTitle>
                                                    <DialogContent className="flex overflow-hidden pr-6 lg:p-0">
                                                        <div className="relative flex h-[90vh] w-[90vw] items-center justify-center p-4">
                                                            <img
                                                                src={prediction.imageUrl}
                                                                alt="Shooting Result"
                                                                className="size-auto max-h-full max-w-full"
                                                            />
                                                        </div>
                                                        <div className="absolute inset-x-0 bottom-10 flex justify-end space-x-2 bg-background p-4 lg:bottom-0">
                                                            <Button
                                                                onClick={() => downloadImage(prediction.imageUrl!)}
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Download className="mr-2 size-4" />
                                                                Download
                                                            </Button>
                                                            <DialogClose asChild>
                                                                <Button variant="outline" size="sm">Close</Button>
                                                            </DialogClose>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Camera className="size-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center justify-between">
                                            <Badge className="font-urban text-xs" variant="secondary">
                                                {prediction.style}
                                            </Badge>
                                            <span className="hidden items-center gap-1 text-muted-foreground sm:flex">
                                                <span className={`border-1 inline-block size-2 rounded-full ${getStatusColor(prediction.status)}`} title={prediction.status} />
                                                {getTimeAgo(prediction.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <EmptyPlaceholder className="min-h-[80vh]">
                    <EmptyPlaceholder.Icon name="photo" />
                    <EmptyPlaceholder.Title>No Headshots yet</EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description><br></br>
                        {studioStatus === "Completed" ? (
                            <>
                                Start a new photo shoot for headshots.<br></br>
                                <ShootModal studioId={studioId} onShootComplete={onShootComplete} />
                            </>
                        ) : (
                            <>
                                Your studio is being processed. In 24 hours, it will be ready to help you create your hyper-realistic dreams!
                            </>
                        )}
                    </EmptyPlaceholder.Description>
                </EmptyPlaceholder>
            )}
        </>
    );
}
*/
