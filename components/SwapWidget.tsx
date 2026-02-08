'use client';

import { useState } from 'react';
import { useCurrentAccount, useSuiClientContext } from '@mysten/dapp-kit';
import { TokenSelect } from './TokenSelect';
import { RouteDisplay } from './RouteDisplay';
import { Pool, OptimizedRoute } from '@/lib/types';
import { ArrowDownUp, RefreshCw, Zap } from 'lucide-react';

export function SwapWidget() {
  const account = useCurrentAccount();
  const ctx = useSuiClientContext();
  const [tokenA, setTokenA] = useState('USDC');
  const [tokenB, setTokenB] = useState('SUI');
  const [amount, setAmount] = useState('');
  const [route, setRoute] = useState<OptimizedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwapTokens = () => {
    setTokenA(tokenB);
    setTokenB(tokenA);
    setRoute(null);
  };

  const handleFindRoutes = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter an amount');
      return;
    }

    setLoading(true);
    setError(null);
    setRoute(null);

    try {
      // Step 1: Fetch pools from all DEXs
      const poolsResponse = await fetch(
        `/api/pools?tokenA=${tokenA}&tokenB=${tokenB}&network=${ctx.network}`
      );

      if (!poolsResponse.ok) {
        throw new Error('Failed to fetch pools');
      }

      const poolsData = await poolsResponse.json();
      const pools: Pool[] = poolsData.pools;

      if (pools.length === 0) {
        throw new Error('No liquidity pools found for this pair');
      }

      // Step 2: Get AI optimization
      const optimizeResponse = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenA,
          tokenB,
          amount: parseFloat(amount),
          pools,
          userPreferences: {
            prioritize: 'balanced',
            maxSlippage: 3,
          },
          network: ctx.network,
        }),
      });

      if (!optimizeResponse.ok) {
        throw new Error('Route optimization failed');
      }

      const optimizeData = await optimizeResponse.json();
      setRoute(optimizeData.route);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!route || !account) return;

    setExecuting(true);
    setError(null);

    try {
      // In production, this would:
      // 1. Build the transaction using Sui SDK
      // 2. Sign with the connected wallet
      // 3. Submit to the Sui network
      // 4. Wait for confirmation

      // For demo, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Swap executed successfully! (Demo mode)');
      setRoute(null);
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Swap execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="swap-widget force-opaque-widget">
      <div className="widget-header">
        <h2>
          <Zap size={24} />
          Swap
        </h2>
        <button className="refresh-button" onClick={() => setRoute(null)} title="Reset">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* From Token */}
      <div className="input-section">
        <div className="input-header">
          <span className="input-label">From</span>
          {account && (
            <button
              className="max-button"
              onClick={() => setAmount('1000')} // Demo: set to 1000
            >
              MAX
            </button>
          )}
        </div>
        <div className="input-row">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setRoute(null);
            }}
            placeholder="0.0"
            className="amount-input"
            min="0"
            step="any"
          />
          <TokenSelect
            value={tokenA}
            onChange={(v) => {
              setTokenA(v);
              setRoute(null);
            }}
            excludeToken={tokenB}
          />
        </div>
      </div>

      {/* Swap Direction Button */}
      <div className="swap-direction">
        <button className="swap-button" onClick={handleSwapTokens}>
          <ArrowDownUp size={18} />
        </button>
      </div>

      {/* To Token */}
      <div className="input-section">
        <div className="input-header">
          <span className="input-label">To</span>
        </div>
        <div className="input-row output-row">
          <div className="estimated-output">
            {route ? route.recommended.totalOutput : '0.0'}
          </div>
          <TokenSelect
            value={tokenB}
            onChange={(v) => {
              setTokenB(v);
              setRoute(null);
            }}
            excludeToken={tokenA}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Find Routes Button */}
      {!route && (
        <button
          className="action-button"
          onClick={handleFindRoutes}
          disabled={!account || !amount || loading}
        >
          {!account
            ? 'Connect Wallet to Swap'
            : loading
              ? 'Finding Best Route...'
              : 'Find Best Route'
          }
          {loading && <span className="spinner" />}
        </button>
      )}

      {/* Route Display */}
      {route && (
        <RouteDisplay
          route={route}
          onExecute={handleExecuteSwap}
          loading={executing}
        />
      )}

      <style jsx>{`
        .swap-widget {
          width: 100%;
          max-width: 440px;
          max-width: 440px;
          background: #13141b;
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          transition: transform 0.3s ease;
        }
        .swap-widget:hover {
          box-shadow: 
            0 30px 60px -12px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .widget-header h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .refresh-button {
          padding: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          transform: rotate(180deg);
        }
        .input-section {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 4px;
          transition: border-color 0.2s;
        }
        .input-section:hover, .input-section:focus-within {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .input-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .input-label {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 500;
        }
        .max-button {
          padding: 4px 12px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 8px;
          color: #818cf8;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .max-button:hover {
          background: rgba(99, 102, 241, 0.25);
          transform: scale(1.05);
        }
        .input-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .amount-input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 32px;
          font-weight: 600;
          outline: none;
          min-width: 0;
          letter-spacing: -0.5px;
        }
        .amount-input::placeholder {
          color: #374151;
        }
        .amount-input::-webkit-outer-spin-button,
        .amount-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .output-row {
          padding: 4px 0;
        }
        .estimated-output {
          flex: 1;
          font-size: 32px;
          font-weight: 600;
          color: #22c55e;
          letter-spacing: -0.5px;
          text-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
        }
        .swap-direction {
          display: flex;
          justify-content: center;
          margin: -14px 0;
          position: relative;
          z-index: 10;
          height: 28px;
        }
        .swap-button {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(30, 30, 45, 1);
          border: 4px solid rgba(20, 20, 35, 1);
          border-radius: 12px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .swap-button:hover {
          color: #6366f1;
          transform: scale(1.1) rotate(180deg);
          background: #252535;
          border-color: rgba(99, 102, 241, 0.5);
        }
        .error-message {
          margin: 16px 0;
          padding: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 16px;
          color: #f87171;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .action-button {
          width: 100%;
          padding: 20px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef);
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
          border: none;
          border-radius: 18px;
          color: white;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          margin-top: 24px;
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .action-button:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4);
        }
        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #374151;
          box-shadow: none;
          animation: none;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
