// API Route: Cross-chain bridge quotes via LI.FI
import { NextResponse } from 'next/server';
import { getCrossChainQuote } from '@/lib/lifi';
import { SUPPORTED_SOURCE_CHAINS } from '@/lib/lifi-constants';

export const dynamic = 'force-dynamic';

interface CrossChainRequest {
    fromChain: string;
    toChain: string;
    fromToken: string;
    toToken: string;
    amount: string;
    userAddress: string;
}

export async function POST(request: Request) {
    try {
        const body: CrossChainRequest = await request.json();

        // Validate request
        if (!body.fromChain || !body.amount || !body.userAddress) {
            return NextResponse.json(
                { error: 'Missing required fields: fromChain, amount, userAddress' },
                { status: 400 }
            );
        }

        // Get chain ID from name
        const chainEntry = Object.entries(SUPPORTED_SOURCE_CHAINS).find(
            ([key]) => key === body.fromChain.toUpperCase()
        );

        if (!chainEntry) {
            return NextResponse.json(
                {
                    error: 'Unsupported source chain',
                    supportedChains: Object.keys(SUPPORTED_SOURCE_CHAINS)
                },
                { status: 400 }
            );
        }

        const fromChainId = chainEntry[1].id;
        const toChain = 'sui'; // Always bridging to Sui

        // Default tokens if not specified
        const fromToken = body.fromToken || '0x0000000000000000000000000000000000000000'; // Native token
        const toToken = body.toToken || '0x2::sui::SUI'; // SUI

        const routes = await getCrossChainQuote(
            fromChainId,
            toChain,
            fromToken,
            toToken,
            body.amount,
            body.userAddress
        );

        return NextResponse.json({
            success: true,
            routes,
            fromChain: body.fromChain,
            toChain: 'Sui',
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error('Cross-chain quote failed:', error);
        return NextResponse.json(
            { error: 'Cross-chain quote failed', details: String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Return supported chains info
    return NextResponse.json({
        supportedSourceChains: Object.entries(SUPPORTED_SOURCE_CHAINS).map(([key, value]) => ({
            id: key,
            chainId: value.id,
            name: value.name,
            symbol: value.symbol,
        })),
        destinationChain: { id: 'SUI', name: 'Sui', symbol: 'SUI' },
    });
}
