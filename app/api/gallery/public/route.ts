// app/api/gallery/public/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { predictions, users } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

interface PublicGalleryQuery {
  page?: number;
  limit?: number;
  style?: string;
  sortBy?: 'newest' | 'popular' | 'trending';
}

// GET - Fetch public gallery images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 per page
    const style = searchParams.get('style') || undefined;
    const sortBy = (searchParams.get('sortBy') as 'newest' | 'popular' | 'trending') || 'newest';
    
    const offset = (page - 1) * limit;

    // Base query conditions
    const baseConditions = and(
      eq(predictions.isShared, true),
      eq(predictions.status, 'completed'),
      sql`${predictions.imageUrl} IS NOT NULL`
    );

    // Add style filter if provided
    const conditions = style 
      ? and(baseConditions, eq(predictions.style, style))
      : baseConditions;

    // Determine sort order
    let orderBy;
    switch (sortBy) {
      case 'popular':
        orderBy = [desc(predictions.likesCount), desc(predictions.createdAt)];
        break;
      case 'trending':
        // Trending = combination of recent + popular
        orderBy = [
          desc(sql`(${predictions.likesCount} * 0.7 + EXTRACT(EPOCH FROM (NOW() - ${predictions.createdAt})) / -86400 * 0.3)`),
          desc(predictions.createdAt)
        ];
        break;
      case 'newest':
      default:
        orderBy = [desc(predictions.createdAt)];
        break;
    }

    // Fetch predictions with user info
    const publicPredictions = await db
      .select({
        id: predictions.id,
        imageUrl: predictions.imageUrl,
        prompt: predictions.prompt,
        style: predictions.style,
        likesCount: predictions.likesCount,
        createdAt: predictions.createdAt,
        userId: predictions.userId,
        // Don't expose user personal info, just basic display info
        userName: sql<string>`COALESCE(${users.firstName}, 'Anonymous') || ' ' || COALESCE(${users.lastName}, '')`.as('userName'),
        userAvatar: users.imageUrl,
      })
      .from(predictions)
      .leftJoin(users, eq(predictions.userId, users.id))
      .where(conditions)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(predictions)
      .where(conditions);

    const totalPages = Math.ceil(totalCount.count / limit);

    return NextResponse.json({
      success: true,
      data: {
        predictions: publicPredictions,
        pagination: {
          page,
          limit,
          totalCount: totalCount.count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          style: style || null,
          sortBy,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching public gallery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET available styles for filtering
export async function OPTIONS() {
  try {
    const styles = await db
      .selectDistinct({ style: predictions.style })
      .from(predictions)
      .where(and(
        eq(predictions.isShared, true),
        eq(predictions.status, 'completed'),
        sql`${predictions.style} IS NOT NULL`
      ))
      .orderBy(predictions.style);

    return NextResponse.json({
      success: true,
      styles: styles.map(s => s.style).filter(Boolean)
    });

  } catch (error) {
    console.error('Error fetching styles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
