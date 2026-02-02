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

use yellow_client::{YellowClient, YellowConfig};
use arbitrage::{PriceFeed, ArbitrageDetector, TradeExecutor};

/// Statistics tracking
struct EngineStats {
    opportunities_found: u64,
    trades_executed: u64,
    total_profit_usd: f64,
    total_gas_saved_usd: f64,
}

impl Default for EngineStats {
    fn default() -> Self {
        Self {
            opportunities_found: 0,
            trades_executed: 0,
            total_profit_usd: 0.0,
            total_gas_saved_usd: 0.0,
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    env_logger::init();

    println!();
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("  ⚡ INSTANT ARB - Gasless Arbitrage Engine");
    println!("  🏆 HackMoney 2026 Submission");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!();

    info!("⚡ Instant Arb Engine - Starting...");

    // Initialize components
    let price_feed = PriceFeed::new();
    let detector = ArbitrageDetector::new(0.5, 0.0); // 0.5% min profit, $0 gas for Yellow
    
    // Initialize Yellow Network client
    let yellow_config = YellowConfig::default();
    let yellow_client = YellowClient::new(yellow_config);
    let mut executor = TradeExecutor::new(yellow_client);
    
    // Engine statistics
    let mut stats = EngineStats::default();
    
    // Trade configuration
    let trade_size_usd = 1000.0; // $1000 per trade
    let auto_execute = false; // Set to true to auto-execute trades
    let max_iterations = 50; // Run for 50 iterations (~8 minutes)

    info!("📡 Connecting to Yellow Network testnet...");
    info!("   Endpoint: wss://clearnet-sandbox.yellow.com/ws");
    
    // Create state channel
    executor.yellow_client_mut().create_state_channel().await?;
    
    info!("✅ Engine initialized successfully!");
    info!("");
    info!("📊 Configuration:");
    info!("   Trade Size: ${}", trade_size_usd);
    info!("   Min Profit: 0.5%");
    info!("   Auto Execute: {}", auto_execute);
    info!("   Max Iterations: {}", max_iterations);
    info!("");

    // Main arbitrage loop
    let mut iteration = 0;
    loop {
        iteration += 1;
        
        if iteration > max_iterations {
            info!("🏁 Reached max iterations ({}). Stopping.", max_iterations);
            break;
        }
        
        info!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        info!("📊 [Iteration {}] Scanning for arbitrage...", iteration);
        
        match price_feed.get_dex_prices("ETH").await {
            Ok(prices) => {
                info!("   Found {} price sources", prices.len());
                
                // Log price range
                if !prices.is_empty() {
                    let min_price = prices.iter().map(|p| p.price).fold(f64::INFINITY, f64::min);
                    let max_price = prices.iter().map(|p| p.price).fold(f64::NEG_INFINITY, f64::max);
                    info!("   Price range: ${:.2} - ${:.2}", min_price, max_price);
                }
                
                if let Some(opportunity) = detector.detect_opportunity(&prices, trade_size_usd) {
                    stats.opportunities_found += 1;
                    
                    info!("");
                    info!("💰 OPPORTUNITY #{} FOUND!", stats.opportunities_found);
                    info!("   Profit: {:.2}% (${:.2} net)", 
                        opportunity.profit_percentage,
                        opportunity.net_profit_usd
                    );
                    
                    if auto_execute {
                        // Execute the trade
                        match executor.execute_arbitrage(&opportunity, trade_size_usd).await {
                            Ok(result) => {
                                stats.trades_executed += 1;
                                stats.total_profit_usd += result.net_profit_usd;
                                stats.total_gas_saved_usd += result.total_gas_saved;
                                
                                info!("");
                                info!("📈 Running Totals:");
                                info!("   Trades: {}", stats.trades_executed);
                                info!("   Profit: ${:.2}", stats.total_profit_usd);
                                info!("   Gas Saved: ${:.2}", stats.total_gas_saved_usd);
                            }
                            Err(e) => {
                                log::error!("Trade execution failed: {}", e);
                            }
                        }
                    } else {
                        info!("   ⏸️  Auto-execute disabled. Set auto_execute=true to trade.");
                    }
                } else {
                    info!("   No profitable opportunities (need >0.5% spread)");
                }
            }
            Err(e) => {
                log::error!("Price fetch error: {}", e);
            }
        }

        // Wait before next scan
        time::sleep(Duration::from_secs(10)).await;
    }

    // Print final summary
    println!();
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("  📊 SESSION SUMMARY");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("  Iterations:        {}", iteration);
    println!("  Opportunities:     {}", stats.opportunities_found);
    println!("  Trades Executed:   {}", stats.trades_executed);
    println!("  Total Profit:      ${:.2}", stats.total_profit_usd);
    println!("  Gas Saved:         ${:.2}", stats.total_gas_saved_usd);
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!();

    // Close the state channel
    executor.yellow_client_mut().close_channel().await?;

    Ok(())
}
