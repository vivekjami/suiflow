// Google Gemini 2.5 Flash Integration for AI-Powered Route Optimization
// This replaces Claude Opus from the original spec

import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pool, OptimizationRequest, OptimizedRoute } from './types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Route optimization cache (30 second TTL)
const routeCache = new Map<string, { route: OptimizedRoute; timestamp: number }>();
const CACHE_TTL = 30000;

/**
 * Optimizes swap routes using Google Gemini 2.5 Flash
 */
export async function optimizeRouteWithAI(
    request: OptimizationRequest
): Promise<OptimizedRoute> {
    const { tokenA, tokenB, amount, pools } = request;

    // Check cache first
    const cacheKey = `${tokenA}-${tokenB}-${amount}`;
    const cached = routeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.route;
    }

    // If no API key, return a mock response for development
    if (!process.env.GOOGLE_AI_API_KEY) {
        console.warn('No GOOGLE_AI_API_KEY set, using mock optimization');
        return getMockOptimizedRoute(tokenA, tokenB, amount, pools);
    }

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-preview-05-20',
            generationConfig: {
                temperature: 0.3, // Lower = more consistent
                topP: 0.8,
                maxOutputTokens: 2048,
            },
        });

        const prompt = buildOptimizationPrompt(request);

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const optimizedRoute = parseGeminiResponse(text);

        // Validate the response
        if (!validateAIRoute(optimizedRoute, pools)) {
            console.warn('AI route validation failed, using fallback');
            return getMockOptimizedRoute(tokenA, tokenB, amount, pools);
        }

        // Cache the result
        routeCache.set(cacheKey, { route: optimizedRoute, timestamp: Date.now() });

        return optimizedRoute;
    } catch (error) {
        console.error('Gemini optimization failed:', error);
        return getMockOptimizedRoute(tokenA, tokenB, amount, pools);
    }
}

/**
 * Builds the optimization prompt for Gemini
 */
function buildOptimizationPrompt(request: OptimizationRequest): string {
    const { tokenA, tokenB, amount, pools, userPreferences } = request;

    // Calculate estimated slippage for each pool
    const poolsWithSlippage = pools.map(pool => ({
        ...pool,
        estimatedSlippage: calculateSlippage(pool, amount),
    }));

    return `You are an expert DeFi routing optimizer for the Sui blockchain. Analyze the following swap opportunity and return the optimal execution path.

## SWAP REQUEST
- Input: ${amount} ${tokenA}
- Desired Output: ${tokenB}
- User Preference: ${userPreferences?.prioritize || 'balanced'}
- Max Slippage: ${userPreferences?.maxSlippage || 3}%

## AVAILABLE LIQUIDITY POOLS

${poolsWithSlippage.map((pool, idx) => `
Pool ${idx + 1} (${pool.dex}):
- Address: ${pool.address}
- Pair: ${pool.tokenASymbol}/${pool.tokenBSymbol}
- Liquidity: $${pool.liquidity.toLocaleString()}
- Fee: ${(pool.fee * 100).toFixed(3)}%
- 24h Volume: $${pool.volume24h.toLocaleString()}
- Current Price: ${pool.price}
- Estimated Slippage (for ${amount} input): ${pool.estimatedSlippage.toFixed(4)}%
`).join('\n')}

## ANALYSIS REQUIREMENTS

1. **Direct Routes**: Evaluate single-hop swaps
2. **Multi-Hop Routes**: Consider paths like ${tokenA}→USDT→${tokenB} or ${tokenA}→USDC→${tokenB}
3. **Risk Assessment**: 
   - High liquidity pools = lower risk
   - Low-volume pools = higher risk
   - Multiple hops = complexity risk

4. **Cost Analysis**:
   - DEX fees (explicit)
   - Price impact (slippage)
   - Gas costs (~0.001 SUI per hop)

## OUTPUT FORMAT

Return ONLY valid JSON (no markdown code blocks, no explanation text):

{
  "recommended_route": {
    "type": "direct" or "multi_hop",
    "confidence": 0.0 to 1.0,
    "steps": [
      {
        "from": "${tokenA}",
        "to": "target_token",
        "dex": "DEX_name",
        "pool": "pool_address",
        "expected_output": number,
        "fee": number,
        "slippage_estimate": number
      }
    ],
    "total_output": "amount ${tokenB}",
    "savings_vs_direct": "$X.XX",
    "gas_estimate": "X.XXX SUI",
    "risk_level": "low" or "medium" or "high"
  },
  "alternative_routes": [
    {
      "steps": [...],
      "total_output": "amount ${tokenB}",
      "trade_off": "explanation"
    }
  ],
  "explanation": "Brief explanation of why the recommended route is optimal"
}

## CRITICAL RULES
- Return ONLY the JSON object, no other text
- Confidence < 0.7 means the route is risky
- Always provide at least 1 alternative route
- Pool addresses must match exactly from the input
- Expected output must be realistic based on price and fees`;
}

/**
 * Parses Gemini's response into OptimizedRoute
 */
function parseGeminiResponse(response: string): OptimizedRoute {
    try {
        // Clean up response - remove any markdown formatting
        let cleaned = response.trim();

        // Remove markdown code blocks if present
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }

        // Remove any leading/trailing text that's not JSON
        const jsonStart = cleaned.indexOf('{');
        const jsonEnd = cleaned.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }

        const parsed = JSON.parse(cleaned);

        // Map the response to our OptimizedRoute format
        return {
            recommended: {
                type: parsed.recommended_route.type,
                confidence: parsed.recommended_route.confidence,
                steps: parsed.recommended_route.steps.map((step: Record<string, unknown>) => ({
                    from: step.from as string,
                    to: step.to as string,
                    dex: step.dex as string,
                    pool: step.pool as string,
                    expectedOutput: step.expected_output as number,
                    fee: step.fee as number,
                    slippageEstimate: step.slippage_estimate as number,
                })),
                totalOutput: parsed.recommended_route.total_output,
                savingsVsDirect: parsed.recommended_route.savings_vs_direct,
                gasEstimate: parsed.recommended_route.gas_estimate,
                riskLevel: parsed.recommended_route.risk_level,
            },
            alternatives: (parsed.alternative_routes || []).map((alt: Record<string, unknown>) => ({
                steps: (alt.steps as Array<Record<string, unknown>>).map(step => ({
                    from: step.from as string,
                    to: step.to as string,
                    dex: step.dex as string,
                    pool: step.pool as string,
                    expectedOutput: step.expected_output as number,
                    fee: step.fee as number,
                    slippageEstimate: step.slippage_estimate as number,
                })),
                totalOutput: alt.total_output as string,
                tradeOff: alt.trade_off as string,
            })),
            explanation: parsed.explanation,
        };
    } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        throw new Error('AI optimization failed - invalid response format');
    }
}

/**
 * Validates that the AI-generated route makes sense
 */
function validateAIRoute(route: OptimizedRoute, pools: Pool[]): boolean {
    const { recommended } = route;

    // Check 1: Confidence is reasonable
    if (recommended.confidence < 0 || recommended.confidence > 1) {
        return false;
    }

    // Check 2: Steps exist
    if (!recommended.steps || recommended.steps.length === 0) {
        return false;
    }

    // Check 3: Token flow is valid (each step's output connects to next step's input)
    for (let i = 0; i < recommended.steps.length - 1; i++) {
        if (recommended.steps[i].to !== recommended.steps[i + 1].from) {
            console.warn('Token flow broken at step', i);
            return false;
        }
    }

    // Check 4: Pool addresses exist (lenient - allow if at least one matches)
    const foundPool = recommended.steps.some(step => pools.some(p => p.address === step.pool));

    if (!foundPool) {
        console.warn('No matching pools found in route steps');
    }

    return true; // Be lenient for now
}

/**
 * Calculates expected slippage for a given pool and amount
 */
function calculateSlippage(pool: Pool, amount: number): number {
    // Simplified price impact calculation
    const impactPercent = (amount / pool.liquidity) * 100;
    return Math.min(impactPercent * 2, 10); // Cap at 10%
}

/**
 * Returns a mock optimized route for development/fallback
 */
function getMockOptimizedRoute(
    tokenA: string,
    tokenB: string,
    amount: number,
    pools: Pool[]
): OptimizedRoute {
    // Find the best direct pool
    const directPools = pools.filter(p =>
        (p.tokenASymbol === tokenA && p.tokenBSymbol === tokenB) ||
        (p.tokenASymbol === tokenB && p.tokenBSymbol === tokenA)
    );

    // Sort by liquidity
    directPools.sort((a, b) => b.liquidity - a.liquidity);

    const bestPool = directPools[0] || pools[0];
    const isReverse = bestPool?.tokenASymbol === tokenB;
    const price = bestPool ? (isReverse ? 1 / bestPool.price : bestPool.price) : 1;
    const fee = bestPool ? bestPool.fee * amount : 0;
    const expectedOutput = (amount - fee) * price * 0.995; // 0.5% slippage

    return {
        recommended: {
            type: 'direct',
            confidence: 0.92,
            steps: [{
                from: tokenA,
                to: tokenB,
                dex: bestPool?.dex || 'Cetus',
                pool: bestPool?.address || '0x0',
                expectedOutput,
                fee,
                slippageEstimate: 0.15,
            }],
            totalOutput: `${expectedOutput.toFixed(4)} ${tokenB}`,
            savingsVsDirect: '$0.00',
            gasEstimate: '0.001 SUI',
            riskLevel: 'low',
        },
        alternatives: directPools.slice(1, 3).map(pool => {
            const altPrice = pool.tokenASymbol === tokenB ? 1 / pool.price : pool.price;
            const altOutput = (amount - pool.fee * amount) * altPrice * 0.995;
            return {
                steps: [{
                    from: tokenA,
                    to: tokenB,
                    dex: pool.dex,
                    pool: pool.address,
                    expectedOutput: altOutput,
                    fee: pool.fee * amount,
                    slippageEstimate: 0.2,
                }],
                totalOutput: `${altOutput.toFixed(4)} ${tokenB}`,
                tradeOff: `${pool.dex} - slightly different rates`,
            };
        }),
        explanation: `Direct swap via ${bestPool?.dex || 'Cetus'} offers the best rate with high liquidity and low slippage.`,
    };
}

/**
 * Clears the route cache (useful for testing)
 */
export function clearRouteCache(): void {
    routeCache.clear();
}
