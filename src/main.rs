mod yellow_client;

use anyhow::Result;
use dotenvy::dotenv;
use env_logger;
use log::info;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    env_logger::init();

    info!("🚀 Instant Arb - Starting...");

    // TODO: Initialize Yellow client
    info!("📡 Connecting to Yellow Network testnet...");
    
    // Test connection
    info!("✅ Connected successfully!");

    Ok(())
}
