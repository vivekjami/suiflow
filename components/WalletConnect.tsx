'use client';

import {
  useCurrentAccount,
  useWallets,
  useConnectWallet,
  useDisconnectWallet
} from '@mysten/dapp-kit';
import { useFormattedAddress } from '@/hooks/useENS';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, LogOut, X } from 'lucide-react';

const POPULAR_WALLETS = [
  {
    name: 'Sui Wallet',
    icon: 'https://lh3.googleusercontent.com/info-card/APP_FULL_COLOR_ICON/20230221191054/1046903253/com.mystenlabs.sui_wallet?s=256',
    downloadUrl: 'https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbnyfyjmg',
  },
  {
    name: 'Suiet',
    icon: 'https://suiet.app/logo.png',
    downloadUrl: 'https://suiet.app/',
  },
  {
    name: 'Ethos Wallet',
    icon: 'https://ethoswallet.xyz/assets/images/ethos-icon-square.png',
    downloadUrl: 'https://ethoswallet.xyz/',
  },
  {
    name: 'Nightly',
    icon: 'https://nightly.app/img/nightly-logo.png',
    downloadUrl: 'https://nightly.app/',
  }
];

// Modal Component rendered via Portal
function WalletModal({
  isOpen,
  onClose,
  detectedWallets,
  uninstalledWallets,
  onConnect
}: {
  isOpen: boolean;
  onClose: () => void;
  detectedWallets: any[];
  uninstalledWallets: typeof POPULAR_WALLETS;
  onConnect: (wallet: any) => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        isolation: 'isolate',
      }}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000000',
          opacity: 0.92,
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '480px',
          backgroundColor: '#13141b',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          padding: '24px',
          color: '#ffffff',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 700,
            color: '#ffffff'
          }}>
            Connect Wallet
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Wallets Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Detected Wallets */}
          {detectedWallets.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '12px',
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0 0 12px 0'
              }}>
                Detected
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {detectedWallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => onConnect(wallet)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>
                      {wallet.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Wallets */}
          <div>
            <h4 style={{
              fontSize: '12px',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 12px 0'
            }}>
              Popular
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {uninstalledWallets.map((wallet) => (
                <a
                  key={wallet.name}
                  href={wallet.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px dashed rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    color: '#fff',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    opacity: 0.8,
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'white',
                    fontSize: '14px',
                  }}>
                    {wallet.name[0]}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500, flex: 1 }}>
                    {wallet.name}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: '#6366f1',
                    background: 'rgba(99, 102, 241, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}>
                    Install
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function WalletConnect() {
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const formattedAddress = useFormattedAddress(account?.address);

  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = (wallet: any) => {
    connect(
      { wallet },
      {
        onSuccess: () => setIsOpen(false),
      }
    );
  };

  if (account) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-icon">🟣</span>
          <span className="wallet-address">{formattedAddress}</span>
        </div>
        <button
          className="disconnect-btn"
          onClick={() => disconnect()}
          title="Disconnect Wallet"
        >
          <LogOut size={16} />
        </button>
        <style jsx>{`
          .wallet-connected {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 6px 6px 6px 12px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
          }
          .wallet-info {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #fff;
          }
          .wallet-icon {
            font-size: 16px;
          }
          .wallet-address {
            font-family: 'Inter', sans-serif;
            letter-spacing: 0.5px;
          }
          .disconnect-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #ef4444;
            cursor: pointer;
            transition: all 0.2s;
          }
          .disconnect-btn:hover {
            background: rgba(239, 68, 68, 0.2);
            transform: scale(1.05);
          }
        `}</style>
      </div>
    );
  }

  const detectedWallets = wallets;
  const uninstalledPopularWallets = POPULAR_WALLETS.filter(
    pw => !wallets.some(w => w.name === pw.name)
  );

  return (
    <>
      <button
        className="connect-btn"
        onClick={() => setIsOpen(true)}
      >
        <Wallet size={18} />
        Connect Wallet
      </button>

      <WalletModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        detectedWallets={detectedWallets}
        uninstalledWallets={uninstalledPopularWallets}
        onConnect={handleConnect}
      />

      <style jsx>{`
        .connect-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: #6366f1;
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .connect-btn:hover {
          background: #5a5dd6;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </>
  );
}
