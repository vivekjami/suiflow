use alloy::primitives::{Address, U256};
use anyhow::Result;
use log::info;
use serde::Deserialize;

/// Common token addresses on Ethereum mainnet
pub mod tokens {
    pub const ETH: &str = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    pub const WETH: &str = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    pub const USDC: &str = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    pub const USDT: &str = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    pub const DAI: &str = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
}

/// 1inch API response for swap quote
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OneInchQuoteResponse {
    pub dst_amount: String,
    pub src_token: OneInchToken,
    pub dst_token: OneInchToken,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OneInchToken {
    pub symbol: String,
    pub decimals: u8,
}

/// Uniswap V4 Pool information
#[derive(Debug, Clone)]
pub struct PoolInfo {
    pub pool_id: String,
    pub token0: Address,
    pub token1: Address,
    pub fee: u32,
    pub sqrt_price_x96: U256,
    pub liquidity: U256,
}

/// Swap quote result
#[derive(Debug, Clone)]
pub struct SwapQuote {
    pub token_in: String,
    pub token_out: String,
    pub amount_in: f64,
    pub amount_out: f64,
    pub price: f64,
    pub price_impact: f64,
}

/// Uniswap V4 Client using on-chain and aggregator APIs
/// 
/// Uniswap V4 uses a singleton PoolManager contract and hooks architecture.
/// For price discovery, we use 1inch aggregator API which includes Uniswap liquidity.
pub struct UniswapV4Client {
    rpc_url: String,
    pool_manager_address: Address,
    client: reqwest::Client,
}

impl UniswapV4Client {
    pub fn new(rpc_url: &str, pool_manager: &str) -> Result<Self> {
        let pool_manager_address: Address = pool_manager.parse()?;

        Ok(Self {
            rpc_url: rpc_url.to_string(),
            pool_manager_address,
            client: reqwest::Client::new(),
        })
    }

    /// Get pool price using 1inch aggregator API
    /// This provides the best price across multiple DEXes including Uniswap
    pub async fn get_pool_price(&self, token_pair: &str) -> Result<f64> {
        // Parse token pair (e.g., "ETH/USDC")
        let parts: Vec<&str> = token_pair.split('/').collect();
        if parts.len() != 2 {
            anyhow::bail!("Invalid token pair format. Use 'TOKEN0/TOKEN1'");
        }

        let (from_token, to_token) = self.resolve_token_addresses(parts[0], parts[1])?;
        
        // Use 1inch API for price quote
        // Amount: 1 ETH = 10^18 wei
        let amount = "1000000000000000000";
        
        let url = format!(
            "https://api.1inch.dev/swap/v6.0/1/quote?src={}&dst={}&amount={}",
            from_token, to_token, amount
        );

        info!("💱 Fetching price for {}", token_pair);

        let response = self.client
            .get(&url)
            .header("accept", "application/json")
            .header("Authorization", "Bearer API_KEY") // 1inch requires API key
            .send()
            .await;

        match response {
            Ok(resp) if resp.status().is_success() => {
                let quote: OneInchQuoteResponse = resp.json().await?;
                let dst_amount = quote.dst_amount.parse::<f64>().unwrap_or(0.0);
                let decimals = quote.dst_token.decimals;
                let price = dst_amount / 10f64.powi(decimals as i32);
                
                info!("   💰 1 {} = {} {}", parts[0], price, parts[1]);
                Ok(price)
            }
            _ => {
                // Fallback to DEX Screener prices if 1inch fails
                self.get_dex_screener_price(parts[0]).await
            }
        }
    }

    /// Fallback price source using DEX Screener
    async fn get_dex_screener_price(&self, token: &str) -> Result<f64> {
        let url = format!(
            "https://api.dexscreener.com/latest/dex/search?q={}",
            token
        );

        let response: serde_json::Value = self.client
            .get(&url)
            .send()
            .await?
            .json()
            .await?;

        if let Some(pairs) = response["pairs"].as_array() {
            if let Some(first_pair) = pairs.first() {
                if let Some(price_str) = first_pair["priceUsd"].as_str() {
                    let price = price_str.parse::<f64>().unwrap_or(0.0);
                    info!("   💵 {} price from DEX Screener: ${:.2}", token, price);
                    return Ok(price);
                }
            }
        }

        anyhow::bail!("Could not fetch price for {}", token)
    }

    /// Get a swap quote for exact input
    pub async fn get_swap_quote(
        &self,
        token_in: &str,
        token_out: &str,
        amount_in: f64,
    ) -> Result<SwapQuote> {
        let price = self.get_pool_price(&format!("{}/{}", token_in, token_out)).await?;
        let amount_out = amount_in * price;
        
        // Estimate price impact (simplified)
        let price_impact = if amount_in > 100000.0 { 0.5 } else { 0.1 };

        Ok(SwapQuote {
            token_in: token_in.to_string(),
            token_out: token_out.to_string(),
            amount_in,
            amount_out,
            price,
            price_impact,
        })
    }

    /// Execute swap through Uniswap V4
    /// 
    /// Note: This is a simulation for demo purposes.
    /// Real execution requires:
    /// 1. Private key for signing
    /// 2. Approval transaction for ERC20 tokens
    /// 3. Encoding V4_SWAP command (0x10)
    /// 4. Submitting to Universal Router
    pub async fn execute_swap(
        &self,
        amount_in: U256,
        token_in: Address,
        token_out: Address,
    ) -> Result<String> {
        info!("🔄 Executing Uniswap V4 swap...");
        info!("   Token In: {:?}", token_in);
        info!("   Token Out: {:?}", token_out);
        info!("   Amount: {:?}", amount_in);
        
        // In production, this would:
        // 1. Build the swap calldata using Universal Router
        // 2. Sign the transaction
        // 3. Submit to the network
        // 4. Wait for confirmation
        
        // Generate simulated transaction hash
        let tx_hash = format!(
            "0x{:064x}",
            std::hash::BuildHasher::hash_one(
                &std::collections::hash_map::RandomState::new(),
                &format!("uniswap_swap:{:?}:{:?}:{:?}", token_in, token_out, amount_in)
            )
        );
        
        info!("✅ Swap executed: {}", &tx_hash[..20]);
        
        Ok(tx_hash)
    }

    /// Resolve token symbol to address
    fn resolve_token_addresses(&self, token0: &str, token1: &str) -> Result<(String, String)> {
        let addr0 = match token0.to_uppercase().as_str() {
            "ETH" => tokens::ETH.to_string(),
            "WETH" => tokens::WETH.to_string(),
            "USDC" => tokens::USDC.to_string(),
            "USDT" => tokens::USDT.to_string(),
            "DAI" => tokens::DAI.to_string(),
            addr if addr.starts_with("0x") => addr.to_string(),
            _ => anyhow::bail!("Unknown token: {}", token0),
        };

        let addr1 = match token1.to_uppercase().as_str() {
            "ETH" => tokens::ETH.to_string(),
            "WETH" => tokens::WETH.to_string(),
            "USDC" => tokens::USDC.to_string(),
            "USDT" => tokens::USDT.to_string(),
            "DAI" => tokens::DAI.to_string(),
            addr if addr.starts_with("0x") => addr.to_string(),
            _ => anyhow::bail!("Unknown token: {}", token1),
        };

        Ok((addr0, addr1))
    }

    /// Get RPC URL
    pub fn rpc_url(&self) -> &str {
        &self.rpc_url
    }

    /// Get Pool Manager address
    pub fn pool_manager(&self) -> Address {
        self.pool_manager_address
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_client_creation() {
        let client = UniswapV4Client::new(
            "https://mainnet.infura.io/v3/test",
            "0x000000000000000000000000000000000000dead",
        );
        assert!(client.is_ok());
    }

    #[tokio::test]
    async fn test_dex_screener_price() {
        let client = UniswapV4Client::new(
            "https://mainnet.infura.io/v3/test",
            "0x000000000000000000000000000000000000dead",
        ).unwrap();
        
        let price = client.get_dex_screener_price("ETH").await;
        assert!(price.is_ok());
        let price = price.unwrap();
        assert!(price > 0.0);
        println!("ETH price: ${}", price);
    }
}
