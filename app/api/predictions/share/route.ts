// app/api/predictions/share/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { predictions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH - Toggle share status for prediction
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
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

    // First, verify the prediction exists and belongs to the user
    const prediction = await db
      .select({
        id: predictions.id,
        userId: predictions.userId,
        isShared: predictions.isShared,
        status: predictions.status,
        imageUrl: predictions.imageUrl
      })
      .from(predictions)
      .where(eq(predictions.id, predictionId))
      .limit(1);

    if (prediction.length === 0) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    // Check if user owns this prediction
    if (prediction[0].userId !== userId) {
      return NextResponse.json(
        { error: 'You can only modify your own predictions' },
        { status: 403 }
      );
    }

    // Check if prediction is completed and has an image
    if (prediction[0].status !== 'completed' || !prediction[0].imageUrl) {
      return NextResponse.json(
        { error: 'Only completed predictions with images can be shared' },
        { status: 400 }
      );
    }

    // Update the share status
    await db
      .update(predictions)
      .set({ 
        isShared: isShared,
        updatedAt: new Date()
      })
      .where(eq(predictions.id, predictionId));

    return NextResponse.json({
      success: true,
      message: isShared ? 'Prediction shared publicly' : 'Prediction made private',
      isShared: isShared
    });

  } catch (error) {
    console.error('Error updating share status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
