'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalletConnect } from '@/components/WalletConnect';
import { SwapWidget } from '@/components/SwapWidget';
import { CrossChainSwap } from '@/components/CrossChainSwap';
import { Zap, ArrowRightLeft, Globe, Sparkles, Github } from 'lucide-react';

type Tab = 'swap' | 'bridge';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('swap');
  const account = useCurrentAccount();

  return (
    <main className="main">
      {/* Background Effects */}
      <div className="bg-gradient" />
      <div className="bg-grid" />

      {/* Header */}
      <header className="header">
        <div className="logo">
          <Zap size={28} className="logo-icon" />
          <span className="logo-text">SuiFlow</span>
        </div>
        <nav className="nav">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="nav-link">
            <Github size={20} />
          </a>
          <WalletConnect />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>Powered by Google Gemini 2.5 Flash</span>
        </div>
        <h1 className="hero-title">
          AI-Powered <span className="gradient-text">Swap Aggregator</span>
        </h1>
        <p className="hero-subtitle">
          Get the best prices across all Sui DEXs with intelligent route optimization
        </p>
      </section>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'swap' ? 'active' : ''}`}
          onClick={() => setActiveTab('swap')}
        >
          <ArrowRightLeft size={18} />
          Swap
        </button>
        <button
          className={`tab ${activeTab === 'bridge' ? 'active' : ''}`}
          onClick={() => setActiveTab('bridge')}
        >
          <Globe size={18} />
          Bridge
        </button>
      </div>

      {/* Main Content */}
      <div className="content">
        {activeTab === 'swap' ? (
          <SwapWidget />
        ) : (
          <CrossChainSwap userAddress={account?.address} />
        )}
      </div>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-item">
          <span className="stat-value">3</span>
          <span className="stat-label">DEXs Integrated</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">5+</span>
          <span className="stat-label">Chains Supported</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">AI</span>
          <span className="stat-label">Route Optimization</span>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">
            <Sparkles size={24} />
          </div>
          <h3>AI-Powered Routing</h3>
          <p>Google Gemini 2.5 Flash analyzes pools to find the optimal swap path</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <ArrowRightLeft size={24} />
          </div>
          <h3>Multi-DEX</h3>
          <p>Aggregates liquidity from Cetus, Turbos, and Kriya DEXs</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <Globe size={24} />
          </div>
          <h3>Cross-Chain</h3>
          <p>Bridge assets from Ethereum, Polygon, Arbitrum via LI.FI</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Built for Sui Hackathon | ENS Integration for Human-Readable Names</p>
      </footer>

      <style jsx>{`
        .main {
          min-height: 100vh;
          padding: 20px;
          position: relative;
          overflow-x: hidden;
        }
        .bg-gradient {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            ellipse 80% 50% at 50% -20%,
            rgba(99, 102, 241, 0.15),
            transparent
          );
          pointer-events: none;
          z-index: 0;
        }
        .bg-grid {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: linear-gradient(
            rgba(255, 255, 255, 0.02) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.02) 1px,
            transparent 1px
          );
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto 40px;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-icon {
          color: #6366f1;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nav {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .nav-link {
          padding: 8px;
          color: #888;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: #fff;
        }
        .hero {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 40px;
          position: relative;
          z-index: 10;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 20px;
          font-size: 13px;
          color: #a5a5ff;
          margin-bottom: 20px;
        }
        .hero-title {
          font-size: 42px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 16px;
          color: #fff;
        }
        .gradient-text {
          background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 18px;
          color: #888;
          line-height: 1.6;
        }
        .tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
          position: relative;
          z-index: 10;
        }
        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #888;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .tab.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);
          color: #6366f1;
        }
        .content {
          display: flex;
          justify-content: center;
          margin-bottom: 60px;
          position: relative;
          z-index: 10;
        }
        .stats {
          display: flex;
          justify-content: center;
          gap: 60px;
          margin-bottom: 60px;
          position: relative;
          z-index: 10;
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          display: block;
          font-size: 32px;
          font-weight: 700;
          color: #6366f1;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 14px;
          color: #666;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          max-width: 1000px;
          margin: 0 auto 60px;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }
        .feature-card {
          padding: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          text-align: center;
        }
        .feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          border-radius: 12px;
          color: #6366f1;
          margin-bottom: 16px;
        }
        .feature-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
        }
        .feature-card p {
          font-size: 14px;
          color: #888;
          line-height: 1.5;
        }
        .footer {
          text-align: center;
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: #666;
          font-size: 13px;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 768px) {
          .hero-title {
            font-size: 32px;
          }
          .stats {
            flex-wrap: wrap;
            gap: 30px;
          }
          .features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
