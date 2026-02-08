'use client';

import { OptimizedRoute, RouteStep } from '@/lib/types';
import { ArrowRight, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface RouteDisplayProps {
    route: OptimizedRoute;
    onExecute: () => void;
    loading?: boolean;
}

export function RouteDisplay({ route, onExecute, loading }: RouteDisplayProps) {
    const { recommended, alternatives, explanation } = route;

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return '#22c55e';
            case 'medium': return '#f59e0b';
            case 'high': return '#ef4444';
            default: return '#888';
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case 'low': return <CheckCircle size={14} />;
            case 'medium': return <AlertTriangle size={14} />;
            case 'high': return <AlertTriangle size={14} />;
            default: return <Info size={14} />;
        }
    };

    return (
        <div className="route-display">
            {/* AI Badge */}
            <div className="ai-badge">
                <Sparkles size={14} />
                <span>AI Optimized</span>
            </div>

            {/* Recommended Route */}
            <div className="route-card recommended">
                <div className="route-header">
                    <h3>Recommended Route</h3>
                    <span className="confidence">
                        {(recommended.confidence * 100).toFixed(0)}% confidence
                    </span>
                </div>

                {/* Route Steps Visualization */}
                <div className="route-steps">
                    {recommended.steps.map((step, idx) => (
                        <div key={idx} className="step-container">
                            <div className="step-token">
                                <div className="token-icon">{step.from.charAt(0)}</div>
                                <span className="token-symbol">{step.from}</span>
                            </div>

                            {idx < recommended.steps.length - 1 && (
                                <div className="step-arrow">
                                    <ArrowRight size={16} />
                                    <span className="dex-label">{step.dex}</span>
                                </div>
                            )}

                            {idx === recommended.steps.length - 1 && (
                                <>
                                    <div className="step-arrow">
                                        <ArrowRight size={16} />
                                        <span className="dex-label">{step.dex}</span>
                                    </div>
                                    <div className="step-token">
                                        <div className="token-icon">{step.to.charAt(0)}</div>
                                        <span className="token-symbol">{step.to}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Route Details */}
                <div className="route-details">
                    <div className="detail-row">
                        <span className="label">Expected Output</span>
                        <span className="value highlight">{recommended.totalOutput}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Savings vs Direct</span>
                        <span className="value savings">{recommended.savingsVsDirect}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Gas Estimate</span>
                        <span className="value">{recommended.gasEstimate}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Risk Level</span>
                        <span
                            className="value risk-badge"
                            style={{ color: getRiskColor(recommended.riskLevel) }}
                        >
                            {getRiskIcon(recommended.riskLevel)}
                            {recommended.riskLevel.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* AI Explanation */}
                <div className="ai-explanation">
                    <Sparkles size={12} />
                    <p>{explanation}</p>
                </div>

                {/* Execute Button */}
                <button
                    className="execute-button"
                    onClick={onExecute}
                    disabled={loading}
                >
                    {loading ? 'Executing...' : 'Execute Swap'}
                </button>
            </div>

            {/* Alternative Routes */}
            {alternatives.length > 0 && (
                <details className="alternatives-section">
                    <summary>
                        View {alternatives.length} Alternative Routes
                    </summary>
                    <div className="alternatives-list">
                        {alternatives.map((alt, idx) => (
                            <div key={idx} className="alt-route-card">
                                <div className="alt-steps">
                                    {alt.steps.map((step: RouteStep, stepIdx: number) => (
                                        <span key={stepIdx} className="alt-step">
                                            {step.from} → {step.to}
                                            <span className="alt-dex">({step.dex})</span>
                                        </span>
                                    ))}
                                </div>
                                <div className="alt-details">
                                    <span className="alt-output">{alt.totalOutput}</span>
                                    <span className="alt-tradeoff">{alt.tradeOff}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            )}

            <style jsx>{`
        .route-display {
          margin-top: 24px;
        }
        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          margin-bottom: 16px;
        }
        .route-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
        }
        .route-card.recommended {
          border-color: rgba(99, 102, 241, 0.3);
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.1) 0%,
            rgba(139, 92, 246, 0.1) 100%
          );
        }
        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .route-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        .confidence {
          font-size: 12px;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
          padding: 4px 10px;
          border-radius: 12px;
        }
        .route-steps {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          margin-bottom: 16px;
          overflow-x: auto;
        }
        .step-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .step-token {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .token-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }
        .token-symbol {
          font-size: 12px;
          color: #ccc;
        }
        .step-arrow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          color: #666;
        }
        .dex-label {
          font-size: 10px;
          color: #888;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .route-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }
        .label {
          color: #888;
        }
        .value {
          color: #fff;
          font-weight: 500;
        }
        .value.highlight {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
        }
        .value.savings {
          color: #22c55e;
        }
        .risk-badge {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ai-explanation {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .ai-explanation p {
          font-size: 13px;
          color: #a5a5ff;
          line-height: 1.4;
          margin: 0;
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
        .alternatives-section {
          margin-top: 16px;
        }
        .alternatives-section summary {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #888;
        }
        .alternatives-section summary:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .alternatives-list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .alt-route-card {
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        .alt-steps {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }
        .alt-step {
          font-size: 13px;
          color: #ccc;
        }
        .alt-dex {
          color: #666;
          font-size: 11px;
          margin-left: 2px;
        }
        .alt-details {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        .alt-output {
          color: #888;
          font-weight: 500;
        }
        .alt-tradeoff {
          color: #666;
          font-style: italic;
        }
      `}</style>
        </div>
    );
}
