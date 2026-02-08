// API Route: Fetch pools from all DEXs
import { NextResponse } from 'next/server';
import { getCetusPools } from '@/lib/dex/cetus';
import { getTurbosPools } from '@/lib/dex/turbos';
import { getKriyaPools } from '@/lib/dex/kriya';
import { Pool } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Cache for 30 seconds

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tokenA = searchParams.get('tokenA');
    const tokenB = searchParams.get('tokenB');
    const network = (searchParams.get('network') as 'mainnet' | 'testnet') || 'mainnet';

    try {
        // Fetch from all DEXs in parallel
        const [cetusPools, turbosPools, kriyaPools] = await Promise.all([
            getCetusPools(network),
            getTurbosPools(network),
            getKriyaPools(network),
        ]);

        let allPools: Pool[] = [...cetusPools, ...turbosPools, ...kriyaPools];

        // Filter pools if token pair specified
        if (tokenA && tokenB) {
            allPools = allPools.filter(pool =>
                (pool.tokenASymbol === tokenA && pool.tokenBSymbol === tokenB) ||
                (pool.tokenASymbol === tokenB && pool.tokenBSymbol === tokenA) ||
                // Also include pools that could be used for multi-hop
                pool.tokenASymbol === tokenA ||
                pool.tokenBSymbol === tokenA ||
                pool.tokenASymbol === tokenB ||
                pool.tokenBSymbol === tokenB
            );
        }

        // Sort by liquidity (higher = better)
        allPools.sort((a, b) => b.liquidity - a.liquidity);

        return NextResponse.json({
            pools: allPools,
            count: allPools.length,
            sources: {
                cetus: cetusPools.length,
                turbos: turbosPools.length,
                kriya: kriyaPools.length,
            },
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error('Failed to fetch pools:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pools', details: String(error) },
            { status: 500 }
        );
    }
}
