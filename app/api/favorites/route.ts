// app/api/favorites/route.ts
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch user's favorites
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userFavorites = await prisma.favoritePrediction.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        prediction: {
          include: {
            studio: {
              select: {
                id: true,
                name: true,
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      favorites: userFavorites
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { predictionId } = await request.json();

    if (!predictionId) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    // Check if prediction exists and get its details
    const prediction = await prisma.prediction.findUnique({
      where: {
        id: predictionId
      },
      include: {
        studio: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoritePrediction.findUnique({
      where: {
        userId_predictionId: {
          userId: session.user.id,
          predictionId: predictionId
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorites
    const newFavorite = await prisma.favoritePrediction.create({
      data: {
        userId: session.user.id,
        predictionId: predictionId,
        // Solo incluir campos adicionales si existen en tu esquema
        ...(prediction.imageUrl && { imageUrl: prediction.imageUrl }),
        ...(prediction.prompt && { prompt: prediction.prompt }),
        ...(prediction.style && { style: prediction.style }),
        ...(prediction.status && { status: prediction.status }),
        ...(prediction.studioId && { studioId: prediction.studioId }),
        ...(prediction.studio?.name && { studioName: prediction.studio.name }),
        ...(prediction.studio?.userId && { studioUserId: prediction.studio.userId }),
        ...(prediction.studio?.user?.name && { studioUserName: prediction.studio.user.name })
      }
    });

    // Update likes count in the original prediction
    const updatedPrediction = await prisma.prediction.update({
      where: {
        id: predictionId
      },
      data: {
        likesCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Added to favorites',
      favorite: newFavorite,
      likesCount: updatedPrediction.likesCount
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { predictionId } = await request.json();

    if (!predictionId) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    // Check if favorited
    const existingFavorite = await prisma.favoritePrediction.findUnique({
      where: {
        userId_predictionId: {
          userId: session.user.id,
          predictionId: predictionId
        }
      }
    });

    if (!existingFavorite) {
      return NextResponse.json(
        { error: 'Not in favorites' },
        { status: 404 }
      );
    }

    // Remove from favorites
    await prisma.favoritePrediction.delete({
      where: {
        userId_predictionId: {
          userId: session.user.id,
          predictionId: predictionId
        }
      }
    });

    // Update likes count in the original prediction
    const updatedPrediction = await prisma.prediction.update({
      where: {
        id: predictionId
      },
      data: {
        likesCount: {
          decrement: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites',
      likesCount: Math.max(0, updatedPrediction.likesCount)
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
