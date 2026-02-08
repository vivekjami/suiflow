'use client';

import { useState } from 'react';
import { useSuiClientContext } from '@mysten/dapp-kit';
import { SUPPORTED_SOURCE_CHAINS } from '@/lib/lifi-constants';
import { CrossChainRoute } from '@/lib/types';
import { ArrowRight, Clock, Wallet, Zap } from 'lucide-react';
import { useSuiAddressFromENS } from '@/hooks/useENS';

interface CrossChainSwapProps {
  userAddress?: string;
}

export function CrossChainSwap({ userAddress }: CrossChainSwapProps) {
  const ctx = useSuiClientContext();
  const [fromChain, setFromChain] = useState('ETHEREUM');
  const [amount, setAmount] = useState('');
  const [routes, setRoutes] = useState<CrossChainRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [destinationInput, setDestinationInput] = useState('');
  const { address: resolvedSuiAddress, loading: resolvingENS } = useSuiAddressFromENS(destinationInput);

  if (ctx.network === 'testnet') {
    return (
      <div className="testnet-warning">
        <div className="warning-icon">⚠️</div>
        <h3>Bridge Unavailable on Testnet</h3>
        <p>Cross-chain bridging is currently only supported on Mainnet.</p>
        <button
          className="switch-btn"
          onClick={() => ctx.selectNetwork('mainnet')}
        >
          Switch to Mainnet
        </button>
        <style jsx>{`
            .testnet-warning {
                text-align: center;
                padding: 40px 20px;
                color: #888;
            }
            .warning-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            h3 { color: #fff; margin-bottom: 8px; }
            .switch-btn {
                margin-top: 20px;
                padding: 10px 20px;
                background: #6366f1;
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
            }
        `}</style>
      </div>
    );
  }

  const chains = Object.entries(SUPPORTED_SOURCE_CHAINS);

  const isValidAddress = (addr: string) => addr.startsWith('0x') && addr.length > 50;
  const effectiveDestination = resolvedSuiAddress || (isValidAddress(destinationInput) ? destinationInput : userAddress);

  const handleFindRoutes = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter an amount');
      return;
    }

    if (!effectiveDestination) {
      setError('Please connect your wallet or enter a destination address');
      return;
    }

    setLoading(true);
    setError(null);
    setRoutes([]);

    try {
      const response = await fetch('/api/cross-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromChain,
          toChain: 'SUI',
          fromToken: '0x0000000000000000000000000000000000000000', // Native token
          toToken: '0x2::sui::SUI',
          amount: String(parseFloat(amount) * 1e18), // Convert to wei
          userAddress: effectiveDestination,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch routes');

      const data = await response.json();
      setRoutes(data.routes || []);

      if (data.routes?.length > 0) {
        setSelectedRoute(data.routes[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteBridge = async () => {
    if (!selectedRoute) return;

    // In production, this would execute the bridge transaction
    alert('Bridge execution would start here! (Demo mode)');
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="cross-chain-swap force-opaque-widget">
      <div className="widget-header">
        <h2>
          <Zap size={24} />
          Cross-Chain Bridge
        </h2>
        <span className="badge">Powered by LI.FI</span>
      </div>

      {/* From Chain Selection */}
      <div className="input-section">
        <label className="input-label">From Chain</label>
        <div className="chain-grid">
          {chains.map(([key, chain]) => (
            <button
              key={key}
              className={`chain-button ${fromChain === key ? 'selected' : ''}`}
              onClick={() => {
                setFromChain(key);
                setRoutes([]);
              }}
            >
              <span className="chain-icon">{chain.symbol.charAt(0)}</span>
              <span className="chain-name">{chain.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="input-section">
        <label className="input-label">Amount</label>
        <div className="amount-row">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setRoutes([]);
            }}
            placeholder="0.0"
            className="amount-input"
          />
          <span className="token-badge">
            {SUPPORTED_SOURCE_CHAINS[fromChain as keyof typeof SUPPORTED_SOURCE_CHAINS]?.symbol}
          </span>
        </div>
      </div>

      {/* Destination */}
      <div className="destination-row-container">
        <label className="input-label">Destination (Optional)</label>
        <div className="destination-input-row">
          <input
            type="text"
            value={destinationInput}
            onChange={(e) => {
              setDestinationInput(e.target.value);
              setRoutes([]);
            }}
            placeholder={userAddress || "Enter Sui address or ENS name"}
            className="destination-input"
          />
          {resolvingENS && <span className="resolving-badge">Resolving ENS...</span>}
          {resolvedSuiAddress && <span className="resolved-badge">✓ {resolvedSuiAddress.slice(0, 6)}...{resolvedSuiAddress.slice(-4)}</span>}
        </div>

        <div className="destination-row">
          <ArrowRight size={20} />
          <div className="destination-info">
            <span className="dest-label">To</span>
            <span className="dest-chain">Sui Network</span>
            <span className="dest-token">SUI</span>
          </div>
          {resolvedSuiAddress && (
            <div className="ens-verification">
              <span className="ens-source">via {destinationInput}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Find Routes Button */}
      {routes.length === 0 && (
        <button
          className="action-button"
          onClick={handleFindRoutes}
          disabled={!effectiveDestination || !amount || loading || resolvingENS}
        >
          {loading ? 'Finding Routes...' : 'Find Bridge Routes'}
        </button>
      )}

      {/* Routes Display */}
      {routes.length > 0 && (
        <div className="routes-section">
          <h3>Available Routes</h3>
          <div className="routes-list">
            {routes.map((route) => (
              <button
                key={route.id}
                className={`route-card ${selectedRoute === route.id ? 'selected' : ''}`}
                onClick={() => setSelectedRoute(route.id)}
              >
                <div className="route-header">
                  <div className="route-output">
                    <span className="output-amount">
                      {(parseFloat(route.toAmount) / 1e9).toFixed(4)}
                    </span>
                    <span className="output-token">SUI</span>
                  </div>
                  <div className="route-meta">
                    <span className="route-time">
                      <Clock size={12} />
                      {formatTime(route.estimatedTime)}
                    </span>
                    <span className="route-gas">
                      <Wallet size={12} />
                      ${route.gasCost}
                    </span>
                  </div>
                </div>
                <div className="route-steps">
                  {route.steps.map((step, idx) => (
                    <span key={idx} className="step-badge">
                      {step.tool}: {step.action}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <button
            className="execute-button"
            onClick={handleExecuteBridge}
            disabled={!selectedRoute}
          >
            Execute Bridge
          </button>
        </div>
      )}

      <style jsx>{`
        .cross-chain-swap {
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
        .badge {
          font-size: 10px;
          color: #9ca3af;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        .input-section {
          margin-bottom: 20px;
        }
        .input-label {
          display: block;
          font-size: 12px;
          color: #9ca3af;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }
        .chain-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .chain-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 14px 8px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .chain-button:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .chain-button.selected {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }
        .chain-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 16px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .chain-name {
          font-size: 11px;
          color: #d1d5db;
          font-weight: 500;
        }
        .amount-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          transition: border-color 0.2s;
        }
        .amount-row:focus-within {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .amount-input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 24px;
          font-weight: 600;
          outline: none;
          letter-spacing: -0.5px;
        }
        .amount-input::placeholder {
          color: #4b5563;
        }
        .token-badge {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }
        .destination-row-container {
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.15);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .destination-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          padding: 10px 14px;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }
        .destination-input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 14px;
          outline: none;
        }
        .destination-input::placeholder {
          color: #6b7280;
        }
        .resolving-badge {
          font-size: 11px;
          color: #fbbf24;
          font-weight: 500;
        }
        .resolved-badge {
            font-size: 11px;
            color: #4ade80;
            font-weight: 600;
            background: rgba(74, 222, 128, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
        }
        .destination-row {
          display: flex;
          align-items: center;
          gap: 16px;
          color: #4ade80;
        }
        .destination-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dest-label {
          font-size: 10px;
          color: #9ca3af;
          text-transform: uppercase;
        }
        .dest-chain {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
        }
        .dest-token {
          font-size: 12px;
          color: #4ade80;
        }
        .ens-verification {
            margin-left: auto;
            font-size: 11px;
            color: #4ade80;
            background: rgba(34, 197, 94, 0.1);
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .error-message {
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #f87171;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .action-button {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .action-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }
        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #374151;
          box-shadow: none;
        }
        .routes-section {
          margin-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 20px;
        }
        .routes-section h3 {
          font-size: 13px;
          color: #9ca3af;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .routes-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .route-card {
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        .route-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }
        .route-card.selected {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
        }
        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .route-output {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .output-amount {
          font-size: 20px;
          font-weight: 700;
          color: #4ade80;
        }
        .output-token {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 500;
        }
        .route-meta {
          display: flex;
          gap: 12px;
        }
        .route-time,
        .route-gas {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #9ca3af;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 6px;
        }
        .route-steps {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .step-badge {
          font-size: 11px;
          color: #d1d5db;
          background: rgba(255, 255, 255, 0.08);
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .execute-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          border-radius: 14px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }
        .execute-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
        }
        .execute-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #374151;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
