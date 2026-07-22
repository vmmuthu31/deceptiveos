use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub server: ServerConfig,
    pub database: DatabaseConfig,
    pub redis: RedisConfig,
    pub honeypots: HoneypotConfig,
    pub ai: AiConfig,
    pub compliance: ComplianceConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub host: String,
    pub port: u16,
    pub data_dir: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub url: String,
    pub pool_size: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisConfig {
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HoneypotConfig {
    pub docker_enabled: bool,
    pub network_name: String,
    pub default_profiles: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiConfig {
    pub ollama_url: String,
    pub model: String,
    pub local_first: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceConfig {
    pub soc2_enabled: bool,
    pub iso27001_enabled: bool,
    pub gdpr_enabled: bool,
    pub audit_log_retention_days: u32,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            server: ServerConfig {
                host: "127.0.0.1".to_string(),
                port: 8080,
                data_dir: PathBuf::from("./data"),
            },
            database: DatabaseConfig {
                url: "postgres://ciphernest:password@localhost/ciphernest".to_string(),
                pool_size: 10,
            },
            redis: RedisConfig {
                url: "redis://127.0.0.1/".to_string(),
            },
            honeypots: HoneypotConfig {
                docker_enabled: true,
                network_name: "ciphernest-deception".to_string(),
                default_profiles: vec!["cowrie-ssh".to_string(), "dionaea-http".to_string()],
            },
            ai: AiConfig {
                ollama_url: "http://127.0.0.1:11434".to_string(),
                model: "llama3.1:8b".to_string(),
                local_first: true,
            },
            compliance: ComplianceConfig {
                soc2_enabled: false,
                iso27001_enabled: false,
                gdpr_enabled: false,
                audit_log_retention_days: 365,
            },
        }
    }
}

impl Config {
    pub fn load() -> Result<Self, crate::Error> {
        let config_path = std::env::var("CIPHERNEST_CONFIG")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("ciphernest.toml"));

        if config_path.exists() {
            let contents = std::fs::read_to_string(&config_path)?;
            let config: Config = toml::from_str(&contents)?;
            Ok(config)
        } else {
            Ok(Config::default())
        }
    }
}
