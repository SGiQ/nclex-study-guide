import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // Try to select with new columns first
        try {
            const result = await pool.query(
                `SELECT id, episode_id, title, file_name, file_type, created_at, nodes, edges 
                 FROM mindmaps 
                 WHERE id = $1 OR episode_id = $1`,
                [parseInt(id)]
            );

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Mind map not found' }, { status: 404 });
            }

            return NextResponse.json(result.rows[0]);
        } catch (newColError: any) {
            // Fallback to legacy columns if nodes/edges don't exist
            console.warn('Fetching single mindmap fallback:', newColError.message);
            const result = await pool.query(
                `SELECT id, episode_id, title, file_name, file_type, created_at 
                 FROM mindmaps 
                 WHERE id = $1 OR episode_id = $1`,
                [parseInt(id)]
            );

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Mind map not found' }, { status: 404 });
            }

            // Return with empty nodes/edges
            return NextResponse.json({ ...result.rows[0], nodes: [], edges: [] });
        }
    } catch (error) {
        console.error('Error fetching mindmap:', error);
        return NextResponse.json({ error: 'Failed to fetch mindmap' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const result = await pool.query(
            'DELETE FROM mindmaps WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Mind map not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Mind map deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting mind map:', error);
        return NextResponse.json({ error: 'Failed to delete mind map' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { nodes, edges } = await request.json();

        const result = await pool.query(
            'UPDATE mindmaps SET nodes = $1, edges = $2 WHERE id = $3 RETURNING *',
            [JSON.stringify(nodes), JSON.stringify(edges), id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Mind map not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            mindmap: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating mind map:', error);
        return NextResponse.json({ error: 'Failed to update mind map' }, { status: 500 });
    }
}
