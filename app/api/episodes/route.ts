import { NextRequest, NextResponse } from 'next/server';
import episodesPN from '@/app/data/episodes.json';
import episodesRN from '@/app/data/episodes-rn.json';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get('program');

    if (program === 'nclex-rn') {
        return NextResponse.json(episodesRN);
    }

    // Default to PN
    return NextResponse.json(episodesPN);
}
