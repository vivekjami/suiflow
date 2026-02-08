'use client';

import {
  useCurrentAccount,
  useWallets,
  useConnectWallet,
  useDisconnectWallet
} from '@mysten/dapp-kit';
import { useFormattedAddress } from '@/hooks/useENS';
import { useState, useRef, useEffect } from 'react';
import { Wallet, LogOut, Download, ExternalLink, X } from 'lucide-react';

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
    icon: 'https://nightly.app/img/nightly-logo.png', // Placeholder, using text/generic if fails
    downloadUrl: 'https://nightly.app/',
  }
];

export function WalletConnect() {
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const formattedAddress = useFormattedAddress(account?.address);

  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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

  // Filter detected wallets
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

      {isOpen && (
        <>
          {/* Overlay - Now a Sibling */}
          <div
            className="modal-overlay"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              zIndex: 19000, // Below modal
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          />

          {/* Modal - Now Independent Fixed Element */}

          {/* Blue Box Clone - Should be OPAQUE */}
          <div
            id="super-final-wallet-modal"
            ref={modalRef}
            style={{
              position: 'fixed',
              top: '20%',
              left: '20%',
              width: '200px',
              height: '200px',
              backgroundColor: 'blue',
              zIndex: 20000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              border: '5px solid yellow'
            }}>
            BLUE BOX CLONE
          </div>


        </>
      )
      }



      <style jsx>{`
            .connect-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 20px;
                background: #6366f1; /* Solid color */
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
                background: #5a5dd6; /* Darker shade on hover */
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
            }

            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.2s ease-out;
            }



            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
            }
            .modal-header h3 {
                margin: 0;
                color: #fff;
                font-size: 20px;
                font-weight: 700;
            }
            .close-btn {
                background: rgba(255, 255, 255, 0.05);
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                color: #888;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            .close-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .wallets-container {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .wallet-group h4 {
                font-size: 12px;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 12px 0;
            }

            .wallet-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }

            .wallet-card {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 16px;
                color: #fff;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                text-decoration: none;
            }
            .wallet-card:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }

            .wallet-card.install {
                border-style: dashed;
                opacity: 0.8;
            }
            .wallet-card.install:hover {
                opacity: 1;
                border-style: solid;
            }

            .wallet-img {
                width: 32px;
                height: 32px;
                border-radius: 8px;
            }
            .wallet-img-placeholder {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                color: white;
            }

            .wallet-name {
                font-size: 14px;
                font-weight: 500;
                flex: 1;
            }

            .install-tag {
                font-size: 10px;
                color: #6366f1;
                background: rgba(99, 102, 241, 0.1);
                padding: 4px 8px;
                border-radius: 12px;
                font-weight: 600;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
      `}</style>
      <style jsx>{`
        /* ... existing styles ... */
      `}</style>
      <style>{`
        #custom-wallet-modal-id {
            background-color: #000000 !important;
            opacity: 1 !important;
            z-index: 2147483647 !important;
        }
      `}</style>
    </>
  );
}
