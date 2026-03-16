import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        hasDatabase: !!process.env.DATABASE_URL,
        dbPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : 'missing',
        nodeEnv: process.env.NODE_ENV
    });
}
