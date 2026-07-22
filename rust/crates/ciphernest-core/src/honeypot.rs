use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Honeypot {
    pub id: Uuid,
    pub name: String,
    pub honeypot_type: HoneypotType,
    pub status: HoneypotStatus,
    pub profile: HoneypotProfile,
    pub container_id: Option<String>,
    pub ip_address: Option<String>,
    pub ports: Vec<u16>,
    pub started_at: Option<DateTime<Utc>>,
    pub last_seen: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HoneypotType {
    CowrieSSH,
    CowrieTelnet,
    DionaeaHTTP,
    DionaeaSMB,
    DionaeaFTP,
    Honeyd,
    CustomLLM,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum HoneypotStatus {
    Stopped,
    Starting,
    Running,
    Error,
    Updating,
}
