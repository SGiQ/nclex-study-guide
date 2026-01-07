import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin Users API
 * GET /api/admin/users
 * 
 * Returns all users with their progress and statistics
 */
export async function GET(req: NextRequest) {
    try {
        // In a real app, this would query a database
        // For now, we'll return a structure that the frontend can populate from localStorage

        return NextResponse.json({
            success: true,
            message: 'User data should be fetched from localStorage on the client side',
            note: 'This endpoint is a placeholder. User management is client-side with localStorage.'
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
