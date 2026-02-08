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
    <div className="cross-chain-swap">
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
          background: linear-gradient(
            180deg,
            rgba(26, 26, 46, 0.95) 0%,
            rgba(22, 22, 40, 0.98) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .widget-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }
        .badge {
          font-size: 11px;
          color: #888;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 12px;
        }
        .input-section {
          margin-bottom: 16px;
        }
        .input-label {
          display: block;
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }
        .chain-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .chain-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chain-button:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .chain-button.selected {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.5);
        }
        .chain-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }
        .chain-name {
          font-size: 11px;
          color: #ccc;
        }
        .amount-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }
        .amount-input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 24px;
          font-weight: 500;
          outline: none;
        }
        .amount-input::placeholder {
          color: #444;
        }
        .token-badge {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }
        .destination-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 12px;
          margin-bottom: 16px;
          color: #22c55e;
        }
        .destination-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dest-label {
          font-size: 11px;
          color: #888;
          text-transform: uppercase;
        }
        .dest-chain {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        .dest-token {
          font-size: 12px;
          color: #22c55e;
        }
        .error-message {
          margin-bottom: 12px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          font-size: 13px;
        }
        .action-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 14px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
        }
        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .routes-section h3 {
          font-size: 14px;
          color: #888;
          margin-bottom: 12px;
        }
        .routes-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }
        .route-card {
          padding: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        .route-card:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .route-card.selected {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.4);
        }
        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .route-output {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .output-amount {
          font-size: 20px;
          font-weight: 600;
          color: #22c55e;
        }
        .output-token {
          font-size: 14px;
          color: #888;
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
          color: #888;
        }
        .route-steps {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .step-badge {
          font-size: 11px;
          color: #888;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 4px;
        }
        .execute-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .execute-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
        }
        .execute-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

  /* CSS Injection */
        .destination-row-container {
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .destination-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 8px 12px;
        }
        .destination-input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 14px;
          outline: none;
        }
        .resolving-badge {
          font-size: 11px;
          color: #f59e0b;
        }
        .resolved-badge {
            font-size: 11px;
            color: #22c55e;
            font-weight: 600;
        }
        .ens-verification {
            margin-left: auto;
            font-size: 11px;
            color: #22c55e;
            background: rgba(34, 197, 94, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
        }
        /* Existing overrides */
        .destination-row {
            padding: 0;
            background: none;
            border: none;
            margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
