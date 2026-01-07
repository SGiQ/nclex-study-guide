import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        // Get admin password from environment variable
        const adminPassword = process.env.ADMIN_PASSWORD || 'NCLEX2026';

        if (password === adminPassword) {
            // Generate a simple session token (in production, use JWT or similar)
            const sessionToken = Buffer.from(`admin:${Date.now()}`).toString('base64');

            return NextResponse.json({
                success: true,
                token: sessionToken
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Invalid password'
            }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Authentication failed'
        }, { status: 500 });
    }
}

// Verify admin session
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                authenticated: false
            }, { status: 401 });
        }

        const token = authHeader.substring(7);

        // Simple token validation (in production, verify JWT signature)
        if (token && token.length > 0) {
            return NextResponse.json({
                authenticated: true
            });
        }

        return NextResponse.json({
            authenticated: false
        }, { status: 401 });
    } catch (error) {
        return NextResponse.json({
            authenticated: false
        }, { status: 500 });
    }
}
