use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub id: Uuid,
    pub timestamp: DateTime<Utc>,
    pub kind: EventKind,
    pub session_id: Option<Uuid>,
    pub source_ip: Option<String>,
    pub honeypot_id: Option<Uuid>,
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventKind {
    SessionStart,
    SessionEnd,
    CommandExecuted,
    FileAccessed,
    AuthenticationAttempt,
    AnomalyDetected,
    AlertGenerated,
    ThreatIntelReceived,
    ComplianceAudit,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionEvent {
    pub session_id: Uuid,
    pub honeypot_id: Uuid,
    pub source_ip: String,
    pub username: Option<String>,
    pub commands: Vec<CommandEvent>,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandEvent {
    pub command: String,
    pub timestamp: DateTime<Utc>,
    pub output: Option<String>,
}
