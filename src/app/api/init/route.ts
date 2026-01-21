
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { supporters } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        // Check if test supporter exists
        const existing = await db.select().from(supporters).where(eq(supporters.slug, 'test')).limit(1);

        if (existing.length > 0) {
            return NextResponse.json({ message: 'Supporter already exists', supporter: existing[0] });
        }

        // Create a default supporter
        const newSupporter = await db.insert(supporters).values({
            name: '스파오 서포터즈',
            slug: 'test',
            description: '스파오의 힙한 아이템을 소개합니다 ✨',
        }).returning();

        return NextResponse.json({ message: 'Test supporter created', supporter: newSupporter[0] });
    } catch (error) {
        console.error('Init Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
