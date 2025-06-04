// app/api/predictions/share/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

// PATCH - Toggle share status for prediction
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { predictionId, isShared } = await request.json();

    if (!predictionId || typeof isShared !== 'boolean') {
      return NextResponse.json(
        { error: 'Prediction ID and isShared status are required' },
        { status: 400 }
      );
    }

    // First, verify the prediction exists and get its details
    const prediction = await prisma.prediction.findUnique({
      where: {
        id: predictionId
      },
      select: {
        id: true,
        studioId: true,
        status: true,
        imageUrl: true,
        isShared: true,
        studio: {
          select: {
            id: true,
            userId: true
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

    // Check if user owns this prediction (through studio ownership)
    if (prediction.studio.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only modify predictions from your own studios' },
        { status: 403 }
      );
    }

    // Check if prediction is completed and has an image
    if (prediction.status !== 'completed' || !prediction.imageUrl) {
      return NextResponse.json(
        { error: 'Only completed predictions with images can be shared' },
        { status: 400 }
      );
    }

    // Update the share status
    const updatedPrediction = await prisma.prediction.update({
      where: {
        id: predictionId
      },
      data: {
        isShared: isShared,
        updatedAt: new Date()
      },
      select: {
        id: true,
        isShared: true,
        imageUrl: true,
        prompt: true,
        style: true,
        studio: {
          select: {
            name: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: isShared ? 'Prediction shared publicly' : 'Prediction made private',
      prediction: updatedPrediction
    });

  } catch (error) {
    console.error('Error updating share status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get shared status of a prediction
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get('predictionId');

    if (!predictionId) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    const prediction = await prisma.prediction.findUnique({
      where: {
        id: predictionId
      },
      select: {
        id: true,
        isShared: true,
        status: true,
        imageUrl: true,
        studio: {
          select: {
            userId: true
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

    // Check if user owns this prediction
    if (prediction.studio.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only view your own predictions' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      predictionId: prediction.id,
      isShared: prediction.isShared,
      canShare: prediction.status === 'completed' && !!prediction.imageUrl
    });

  } catch (error) {
    console.error('Error fetching share status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
