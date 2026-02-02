use anyhow::Result;
use log::info;
use serde::{Deserialize, Serialize};

/// LI.FI API Client for cross-chain routing
/// API Docs: https://docs.li.fi/
pub struct LiFiClient {
    client: reqwest::Client,
    base_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LiFiQuoteRequest {
    pub from_chain: String,
    pub to_chain: String,
    pub from_token: String,
    pub to_token: String,
    pub from_amount: String,
    pub from_address: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LiFiEstimate {
    pub from_amount: String,
    pub to_amount: String,
    pub to_amount_min: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LiFiAction {
    pub from_chain_id: u64,
    pub to_chain_id: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LiFiQuoteResponse {
    pub id: String,
    #[serde(rename = "type")]
    pub quote_type: String,
    pub tool: String,
    pub action: LiFiAction,
    pub estimate: LiFiEstimate,
}

#[derive(Debug, Clone)]
pub struct CrossChainRoute {
    pub route_id: String,
    pub tool: String,
    pub from_chain: u64,
    pub to_chain: u64,
    pub from_amount: f64,
    pub to_amount: f64,
    pub to_amount_min: f64,
}

impl LiFiClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::new(),
            base_url: "https://li.quest/v1".to_string(),
        }
    }

    /// Get a cross-chain swap quote from LI.FI
    /// 
    /// # Arguments
    /// * `from_chain` - Source chain ID (e.g., "1" for Ethereum, "137" for Polygon)
    /// * `to_chain` - Destination chain ID
    /// * `from_token` - Token address on source chain (use "0x0..." for native token)
    /// * `to_token` - Token address on destination chain
    /// * `amount` - Amount in smallest unit (wei)
    /// * `from_address` - Sender wallet address
    pub async fn get_cross_chain_route(
        &self,
        from_chain: &str,
        to_chain: &str,
        from_token: &str,
        to_token: &str,
        amount: &str,
        from_address: &str,
    ) -> Result<CrossChainRoute> {
        let url = format!(
            "{}/quote?fromChain={}&toChain={}&fromToken={}&toToken={}&fromAmount={}&fromAddress={}",
            self.base_url, from_chain, to_chain, from_token, to_token, amount, from_address
        );

        info!("🔗 Fetching LI.FI route: {} -> {}", from_chain, to_chain);

        let response = self.client
            .get(&url)
            .header("accept", "application/json")
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            anyhow::bail!("LI.FI API error: {}", error_text);
        }

        let quote: LiFiQuoteResponse = response.json().await?;

        let from_amount = quote.estimate.from_amount.parse::<f64>().unwrap_or(0.0);
        let to_amount = quote.estimate.to_amount.parse::<f64>().unwrap_or(0.0);
        let to_amount_min = quote.estimate.to_amount_min.parse::<f64>().unwrap_or(0.0);

        info!(
            "✅ LI.FI Route found via {}: {} -> {} (min: {})",
            quote.tool, from_amount, to_amount, to_amount_min
        );

        Ok(CrossChainRoute {
            route_id: quote.id,
            tool: quote.tool,
            from_chain: quote.action.from_chain_id,
            to_chain: quote.action.to_chain_id,
            from_amount,
            to_amount,
            to_amount_min,
        })
    }

    /// Get available chains from LI.FI
    pub async fn get_chains(&self) -> Result<Vec<String>> {
        let url = format!("{}/chains", self.base_url);
        let response: serde_json::Value = self.client
            .get(&url)
            .send()
            .await?
            .json()
            .await?;

        let chains = response["chains"]
            .as_array()
            .map(|arr| {
                arr.iter()
                    .filter_map(|c| c["name"].as_str().map(String::from))
                    .collect()
            })
            .unwrap_or_default();

        Ok(chains)
    }
}

impl Default for LiFiClient {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_lifi_chains() {
        let client = LiFiClient::new();
        let chains = client.get_chains().await;
        assert!(chains.is_ok());
        let chains = chains.unwrap();
        assert!(!chains.is_empty());
        println!("Available chains: {:?}", chains);
    }
}
