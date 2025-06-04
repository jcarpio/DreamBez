// app/api/gallery/public/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

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
    const whereConditions: Prisma.PredictionWhereInput = {
      isShared: true,
      status: 'completed',
      imageUrl: {
        not: null
      }
    };

    // Add style filter if provided
    if (style) {
      whereConditions.style = style;
    }

    // Determine sort order
    let orderBy: Prisma.PredictionOrderByWithRelationInput[];
    
    switch (sortBy) {
      case 'popular':
        orderBy = [
          { likesCount: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      case 'trending':
        // For trending, we'll use a combination approach
        // Since Prisma doesn't support complex SQL expressions in orderBy,
        // we'll fetch by popular first, then filter by recent
        orderBy = [
          { likesCount: 'desc' },
          { createdAt: 'desc' }
        ];
        // Add date filter for trending (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        whereConditions.createdAt = {
          gte: sevenDaysAgo
        };
        break;
      case 'newest':
      default:
        orderBy = [{ createdAt: 'desc' }];
        break;
    }

    // Fetch predictions with studio and user info
    const publicPredictions = await prisma.prediction.findMany({
      where: whereConditions,
      orderBy: orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        imageUrl: true,
        prompt: true,
        style: true,
        likesCount: true,
        createdAt: true,
        studio: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    // Transform data to match expected format
    const transformedPredictions = publicPredictions.map(prediction => ({
      id: prediction.id,
      imageUrl: prediction.imageUrl,
      prompt: prediction.prompt,
      style: prediction.style,
      likesCount: prediction.likesCount || 0,
      createdAt: prediction.createdAt,
      studioId: prediction.studio?.id,
      studioName: prediction.studio?.name,
      userName: prediction.studio?.user?.name || 'Anonymous',
      userAvatar: prediction.studio?.user?.image,
    }));

    // Get total count for pagination
    const totalCount = await prisma.prediction.count({
      where: whereConditions
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        predictions: transformedPredictions,
        pagination: {
          page,
          limit,
          totalCount,
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

// GET available styles for filtering
export async function OPTIONS() {
  try {
    const styles = await prisma.prediction.findMany({
      where: {
        isShared: true,
        status: 'completed',
        style: {
          not: null
        }
      },
      select: {
        style: true
      },
      distinct: ['style'],
      orderBy: {
        style: 'asc'
      }
    });

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

// POST - Get gallery with advanced filters (optional endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      page = 1, 
      limit = 20, 
      styles = [], 
      sortBy = 'newest',
      search = '',
      dateRange = null 
    } = body;

    const offset = (page - 1) * Math.min(limit, 50);

    const whereConditions: Prisma.PredictionWhereInput = {
      isShared: true,
      status: 'completed',
      imageUrl: {
        not: null
      }
    };

    // Add style filters
    if (styles.length > 0) {
      whereConditions.style = {
        in: styles
      };
    }

    // Add search filter
    if (search) {
      whereConditions.OR = [
        {
          prompt: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          studio: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Add date range filter
    if (dateRange && dateRange.from && dateRange.to) {
      whereConditions.createdAt = {
        gte: new Date(dateRange.from),
        lte: new Date(dateRange.to)
      };
    }

    // Determine sort order
    let orderBy: Prisma.PredictionOrderByWithRelationInput[];
    switch (sortBy) {
      case 'popular':
        orderBy = [{ likesCount: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'trending':
        orderBy = [{ likesCount: 'desc' }, { createdAt: 'desc' }];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Combine with existing createdAt filter if it exists
        if (whereConditions.createdAt && typeof whereConditions.createdAt === 'object') {
          whereConditions.createdAt = {
            ...whereConditions.createdAt,
            gte: sevenDaysAgo
          };
        } else {
          whereConditions.createdAt = {
            gte: sevenDaysAgo
          };
        }
        break;
      default:
        orderBy = [{ createdAt: 'desc' }];
    }

    const [predictions, totalCount] = await Promise.all([
      prisma.prediction.findMany({
        where: whereConditions,
        orderBy: orderBy,
        skip: offset,
        take: Math.min(limit, 50),
        select: {
          id: true,
          imageUrl: true,
          prompt: true,
          style: true,
          likesCount: true,
          createdAt: true,
          studio: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      }),
      prisma.prediction.count({ where: whereConditions })
    ]);

    const transformedPredictions = predictions.map(prediction => ({
      id: prediction.id,
      imageUrl: prediction.imageUrl,
      prompt: prediction.prompt,
      style: prediction.style,
      likesCount: prediction.likesCount || 0,
      createdAt: prediction.createdAt,
      studioId: prediction.studio?.id,
      studioName: prediction.studio?.name,
      userName: prediction.studio?.user?.name || 'Anonymous',
      userAvatar: prediction.studio?.user?.image,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        predictions: transformedPredictions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          styles,
          sortBy,
          search,
          dateRange
        }
      }
    });

  } catch (error) {
    console.error('Error fetching filtered gallery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
