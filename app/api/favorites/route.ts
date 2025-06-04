// app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { favorites, predictions } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET - Fetch user's favorites
export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userFavorites = await db
      .select({
        id: favorites.id,
        predictionId: favorites.predictionId,
        createdAt: favorites.createdAt,
        prediction: {
          id: predictions.id,
          imageUrl: predictions.imageUrl,
          prompt: predictions.prompt,
          style: predictions.style,
          status: predictions.status,
          createdAt: predictions.createdAt,
          isShared: predictions.isShared,
          likesCount: predictions.likesCount,
        }
      })
      .from(favorites)
      .innerJoin(predictions, eq(favorites.predictionId, predictions.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

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
    const { userId } = auth();
    
    if (!userId) {
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

    // Check if prediction exists
    const prediction = await db
      .select()
      .from(predictions)
      .where(eq(predictions.id, predictionId))
      .limit(1);

    if (prediction.length === 0) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.predictionId, predictionId)
      ))
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json(
        { error: 'Already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorites
    await db.insert(favorites).values({
      userId,
      predictionId,
      createdAt: new Date(),
    });

    // Update likes count
    const newLikesCount = prediction[0].likesCount ? prediction[0].likesCount + 1 : 1;
    
    await db
      .update(predictions)
      .set({ 
        likesCount: newLikesCount,
        updatedAt: new Date()
      })
      .where(eq(predictions.id, predictionId));

    return NextResponse.json({
      success: true,
      message: 'Added to favorites',
      likesCount: newLikesCount
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
    const { userId } = auth();
    
    if (!userId) {
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
    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.predictionId, predictionId)
      ))
      .limit(1);

    if (existingFavorite.length === 0) {
      return NextResponse.json(
        { error: 'Not in favorites' },
        { status: 404 }
      );
    }

    // Remove from favorites
    await db
      .delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.predictionId, predictionId)
      ));

    // Update likes count
    const prediction = await db
      .select()
      .from(predictions)
      .where(eq(predictions.id, predictionId))
      .limit(1);

    const newLikesCount = Math.max(0, (prediction[0]?.likesCount || 1) - 1);
    
    await db
      .update(predictions)
      .set({ 
        likesCount: newLikesCount,
        updatedAt: new Date()
      })
      .where(eq(predictions.id, predictionId));

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites',
      likesCount: newLikesCount
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
