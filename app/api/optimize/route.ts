// API Route: AI-powered route optimization using Google Gemini
import { NextResponse } from 'next/server';
import { optimizeRouteWithAI } from '@/lib/gemini';
import { OptimizationRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body: OptimizationRequest = await request.json();

        // Validate request
        if (!body.tokenA || !body.tokenB || !body.amount) {
            return NextResponse.json(
                { error: 'Missing required fields: tokenA, tokenB, amount' },
                { status: 400 }
            );
        }

        if (!body.pools || body.pools.length === 0) {
            return NextResponse.json(
                { error: 'No pools provided for optimization' },
                { status: 400 }
            );
        }

        // Optimize route using Gemini AI
        const optimizedRoute = await optimizeRouteWithAI({
            tokenA: body.tokenA,
            tokenB: body.tokenB,
            amount: body.amount,
            pools: body.pools,
            userPreferences: body.userPreferences,
            network: body.network,
        });

        return NextResponse.json({
            success: true,
            route: optimizedRoute,
            timestamp: Date.now(),
            model: 'gemini-2.5-flash',
        });
    } catch (error) {
        console.error('Route optimization failed:', error);
        return NextResponse.json(
            { error: 'Route optimization failed', details: String(error) },
            { status: 500 }
        );
    }
}
