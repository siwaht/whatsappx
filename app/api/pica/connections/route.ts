import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPicaClient } from '@/lib/pica';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // We can allow passing the key in headers for testing, or use env
        const secretKey = request.headers.get('x-pica-secret') || undefined;

        const pica = getPicaClient(secretKey);
        const connections = await pica.listConnections();

        // Filter for vector DBs if needed, or just return all
        // Common vector DBs: mongodb, pinecone, weaviate, supabase, qdrant
        const vectorPlatforms = ['mongodb', 'pinecone', 'weaviate', 'supabase', 'qdrant', 'chroma'];
        const vectorConnections = connections.filter(c => vectorPlatforms.includes(c.platform));

        return NextResponse.json(vectorConnections);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to list connections' },
            { status: 500 }
        );
    }
}
