import { NextResponse } from 'next/server'
import episodes from '@/app/data/episodes.json'

export async function GET() {
    return NextResponse.json(episodes)
}
