use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HoneypotProfile {
    pub name: String,
    pub description: String,
    pub honeypot_type: String,
    pub image: String,
    pub ports: Vec<PortMapping>,
    pub environment: HashMap<String, String>,
    pub volumes: Vec<VolumeMapping>,
    pub credentials: Vec<Credential>,
    pub services: Vec<ServiceConfig>,
    pub lures: Vec<Lure>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortMapping {
    pub host_port: u16,
    pub container_port: u16,
    pub protocol: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VolumeMapping {
    pub host_path: String,
    pub container_path: String,
    pub read_only: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Credential {
    pub username: String,
    pub password: Option<String>,
    pub private_key: Option<String>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceConfig {
    pub name: String,
    pub port: u16,
    pub banner: Option<String>,
    pub fake_files: Vec<FakeFile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FakeFile {
    pub path: String,
    pub content: String,
    pub permissions: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lure {
    pub name: String,
    pub lure_type: LureType,
    pub content: String,
    pub trigger: LureTrigger,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LureType {
    File,
    Network,
    Database,
    Email,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LureTrigger {
    Access,
    Connection,
    Query,
    Open,
}
