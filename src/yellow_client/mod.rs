use anyhow::Result;
use log::info;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};

/// Yellow Network Configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YellowConfig {
    pub api_url: String,
    pub testnet: bool,
}

impl Default for YellowConfig {
    fn default() -> Self {
        Self {
            api_url: "wss://clearnet-sandbox.yellow.com/ws".to_string(),
            testnet: true,
        }
    }
}

/// State Channel status
#[derive(Debug, Clone, PartialEq)]
pub enum ChannelState {
    Closed,
    Opening,
    Open,
    Settling,
}

/// Represents an off-chain state channel balance
#[derive(Debug, Clone)]
pub struct ChannelBalance {
    pub token: String,
    pub amount: f64,
    pub locked: f64,
}

/// Trade result from Yellow Network state channel
#[derive(Debug, Clone)]
pub struct TradeResult {
    pub tx_hash: String,
    pub from_token: String,
    pub to_token: String,
    pub amount_in: f64,
    pub amount_out: f64,
    pub gas_cost: f64, // Always 0 for state channel trades!
    pub timestamp: i64,
}

/// Yellow Network Client for gasless state channel trading
/// 
/// Yellow Network uses ClearSync protocol with Nitrolite state channels (ERC-7824)
/// to enable off-chain trading with on-chain settlement only when needed.
/// 
/// WebSocket Endpoints:
/// - Production: wss://clearnet.yellow.com/ws
/// - Sandbox: wss://clearnet-sandbox.yellow.com/ws
pub struct YellowClient {
    config: YellowConfig,
    client: reqwest::Client,
    channel_state: ChannelState,
    channel_id: Option<String>,
    nonce: AtomicU64,
    // Simulated balances for demo
    balances: std::collections::HashMap<String, f64>,
}

impl YellowClient {
    pub fn new(config: YellowConfig) -> Self {
        let mut balances = std::collections::HashMap::new();
        // Initialize with demo balances
        balances.insert("ETH".to_string(), 10.0);
        balances.insert("USDC".to_string(), 25000.0);
        balances.insert("USDT".to_string(), 25000.0);
        
        Self {
            config,
            client: reqwest::Client::new(),
            channel_state: ChannelState::Closed,
            channel_id: None,
            nonce: AtomicU64::new(0),
            balances,
        }
    }

    /// Create a new state channel with Yellow Network
    /// 
    /// State channels allow for numerous transactions off-chain,
    /// with only the final "state" being recorded on the blockchain.
    pub async fn create_state_channel(&mut self) -> Result<String> {
        info!("📡 Creating Yellow Network state channel...");
        info!("   Endpoint: {}", self.config.api_url);
        
        self.channel_state = ChannelState::Opening;
        
        // Generate a unique channel ID
        let channel_id = format!(
            "yellow_channel_{}_{}", 
            chrono::Utc::now().timestamp_millis(),
            self.nonce.fetch_add(1, Ordering::SeqCst)
        );
        
        // In production, this would:
        // 1. Connect to Yellow WebSocket
        // 2. Send channel creation request
        // 3. Wait for counterparty acknowledgment
        // 4. Sign and submit opening transaction
        
        // Simulate channel opening delay
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        
        self.channel_id = Some(channel_id.clone());
        self.channel_state = ChannelState::Open;
        
        info!("✅ State channel created: {}", channel_id);
        info!("   🎯 Gas cost: $0.00 (off-chain!)");
        
        Ok(channel_id)
    }

    /// Execute a trade through the Yellow Network state channel
    /// 
    /// This is the KEY VALUE PROPOSITION:
    /// - Trades are executed off-chain with ZERO gas costs
    /// - Only final settlement requires on-chain transaction
    /// - Enables high-frequency trading strategies that would be
    ///   unprofitable on traditional DEXes due to gas costs
    pub async fn execute_trade(
        &mut self, 
        amount: f64, 
        from_token: &str, 
        to_token: &str
    ) -> Result<TradeResult> {
        // Ensure channel is open
        if self.channel_state != ChannelState::Open {
            self.create_state_channel().await?;
        }

        let nonce = self.nonce.fetch_add(1, Ordering::SeqCst);
        
        info!("🔄 Executing trade via Yellow state channel...");
        info!("   {} {} -> {}", amount, from_token, to_token);
        
        // Check balance
        let from_balance = self.balances.get(from_token).copied().unwrap_or(0.0);
        if from_balance < amount {
            anyhow::bail!("Insufficient {} balance: {} < {}", from_token, from_balance, amount);
        }
        
        // Calculate swap (using a simple mock rate for demo)
        // In production, this would query Yellow's orderbook
        let rate = self.get_exchange_rate(from_token, to_token).await?;
        let amount_out = amount * rate;
        
        // Update simulated balances
        *self.balances.entry(from_token.to_string()).or_insert(0.0) -= amount;
        *self.balances.entry(to_token.to_string()).or_insert(0.0) += amount_out;
        
        // Generate transaction hash
        let tx_hash = format!(
            "0x{:064x}", 
            std::hash::BuildHasher::hash_one(
                &std::collections::hash_map::RandomState::new(),
                &format!("{}:{}:{}:{}", nonce, from_token, to_token, amount)
            )
        );
        
        let result = TradeResult {
            tx_hash: tx_hash.clone(),
            from_token: from_token.to_string(),
            to_token: to_token.to_string(),
            amount_in: amount,
            amount_out,
            gas_cost: 0.0, // ZERO GAS - This is the key benefit!
            timestamp: chrono::Utc::now().timestamp(),
        };
        
        info!("✅ Trade executed successfully!");
        info!("   📝 TX: {}", &tx_hash[..20]);
        info!("   💵 In: {} {}", amount, from_token);
        info!("   💵 Out: {:.6} {}", amount_out, to_token);
        info!("   ⛽ Gas: $0.00 (gasless via state channel!)");
        
        Ok(result)
    }

    /// Get current balance in the state channel
    pub async fn get_balance(&self, token: &str) -> Result<f64> {
        let balance = self.balances.get(token).copied().unwrap_or(0.0);
        Ok(balance)
    }
    
    /// Get all balances
    pub fn get_all_balances(&self) -> Vec<ChannelBalance> {
        self.balances
            .iter()
            .map(|(token, &amount)| ChannelBalance {
                token: token.clone(),
                amount,
                locked: 0.0,
            })
            .collect()
    }

    /// Get exchange rate between two tokens
    async fn get_exchange_rate(&self, from: &str, to: &str) -> Result<f64> {
        // In production, this would query Yellow's aggregated orderbook
        // For demo, we use approximate rates
        let rate = match (from, to) {
            ("ETH", "USDC") | ("ETH", "USDT") | ("ETH", "USD") => 2300.0,
            ("USDC", "ETH") | ("USDT", "ETH") | ("USD", "ETH") => 1.0 / 2300.0,
            ("USDC", "USDT") | ("USDT", "USDC") => 1.0,
            ("BTC", "USDC") | ("BTC", "USDT") => 45000.0,
            ("USDC", "BTC") | ("USDT", "BTC") => 1.0 / 45000.0,
            _ => 1.0,
        };
        Ok(rate)
    }

    /// Close the state channel and settle on-chain
    pub async fn close_channel(&mut self) -> Result<String> {
        if self.channel_state != ChannelState::Open {
            anyhow::bail!("No open channel to close");
        }

        info!("📤 Closing state channel and settling on-chain...");
        
        self.channel_state = ChannelState::Settling;
        
        // In production, this would:
        // 1. Sign final state
        // 2. Submit settlement transaction to blockchain
        // 3. Wait for confirmation
        
        let settlement_tx = format!(
            "0x{:064x}",
            std::hash::BuildHasher::hash_one(
                &std::collections::hash_map::RandomState::new(),
                &format!("settlement:{:?}", self.channel_id)
            )
        );
        
        self.channel_state = ChannelState::Closed;
        self.channel_id = None;
        
        info!("✅ Channel settled: {}", &settlement_tx[..20]);
        
        Ok(settlement_tx)
    }

    /// Check if the client is connected
    pub fn is_connected(&self) -> bool {
        self.channel_state == ChannelState::Open
    }

    /// Get channel state
    pub fn get_channel_state(&self) -> &ChannelState {
        &self.channel_state
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_connection() {
        let config = YellowConfig::default();
        let _client = YellowClient::new(config);
        // Basic instantiation test
    }

    #[tokio::test]
    async fn test_create_channel() {
        let config = YellowConfig::default();
        let mut client = YellowClient::new(config);
        
        let channel_id = client.create_state_channel().await;
        assert!(channel_id.is_ok());
        assert!(client.is_connected());
    }

    #[tokio::test]
    async fn test_execute_trade() {
        let config = YellowConfig::default();
        let mut client = YellowClient::new(config);
        
        // Create channel first
        client.create_state_channel().await.unwrap();
        
        // Execute trade
        let result = client.execute_trade(1000.0, "USDC", "ETH").await;
        assert!(result.is_ok());
        
        let trade = result.unwrap();
        assert_eq!(trade.gas_cost, 0.0); // Gasless!
        assert!(trade.amount_out > 0.0);
    }

    #[tokio::test]
    async fn test_balance() {
        let config = YellowConfig::default();
        let client = YellowClient::new(config);
        
        let eth_balance = client.get_balance("ETH").await.unwrap();
        assert_eq!(eth_balance, 10.0);
        
        let usdc_balance = client.get_balance("USDC").await.unwrap();
        assert_eq!(usdc_balance, 25000.0);
    }
}
