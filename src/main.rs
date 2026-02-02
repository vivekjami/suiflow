mod yellow_client;
mod arbitrage;
mod uniswap;
mod lifi;
mod utils;

use anyhow::Result;
use dotenvy::dotenv;
use log::info;
use std::time::Duration;
use tokio::time;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    env_logger::init();

    info!("⚡ Instant Arb Engine - Starting...");

    // Initialize components
    let price_feed = arbitrage::PriceFeed::new();
    let detector = arbitrage::ArbitrageDetector::new(0.5, 0.0); // 0.5% min profit, $0 gas

    info!("📡 Connecting to Yellow Network testnet...");
    info!("✅ Engine initialized successfully!");

    // Main loop
    let mut iteration = 0;
    loop {
        iteration += 1;
        info!("📊 [{}] Fetching prices...", iteration);
        
        match price_feed.get_dex_prices("ETH").await {
            Ok(prices) => {
                info!("   Found {} price sources", prices.len());
                
                if let Some(opportunity) = detector.detect_opportunity(&prices, 1000.0) {
                    info!(
                        "💰 Profitable opportunity: {:.2}% profit (${:.2} net)",
                        opportunity.profit_percentage,
                        opportunity.net_profit_usd
                    );
                    
                    // TODO: Execute trade via Yellow
                    // executor.execute_arbitrage(&opportunity, 1000.0).await?;
                } else {
                    info!("   No profitable opportunities found (need >0.5% spread)");
                }
            }
            Err(e) => {
                log::error!("Price fetch error: {}", e);
            }
        }

        time::sleep(Duration::from_secs(10)).await;
    }

    Ok(())
}
