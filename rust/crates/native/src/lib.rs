use napi::bindgen_prelude::*;
use sha2::{Digest, Sha256};

#[napi]
pub fn hash_sha256(input: String) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    format!("{:x}", result)
}

#[napi]
pub fn hash_sha256_bytes(input: Buffer) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_ref());
    let result = hasher.finalize();
    format!("{:x}", result)
}

#[napi]
pub fn generate_session_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

#[napi]
pub fn generate_honeypot_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

#[napi]
pub fn validate_ip(ip: String) -> bool {
    ip.parse::<std::net::IpAddr>().is_ok()
}

#[napi]
pub fn parse_port_range(range: String) -> Vec<u32> {
    let mut ports = Vec::new();
    for part in range.split(',') {
        if part.contains('-') {
            let parts: Vec<&str> = part.split('-').collect();
            if parts.len() == 2 {
                if let (Ok(start), Ok(end)) = (parts[0].parse::<u32>(), parts[1].parse::<u32>()) {
                    ports.extend(start..=end);
                }
            }
        } else if let Ok(port) = part.trim().parse::<u32>() {
            ports.push(port);
        }
    }
    ports
}

#[napi]
pub fn entropy_score(data: String) -> f64 {
    let mut freq = [0u32; 256];
    for byte in data.bytes() {
        freq[byte as usize] += 1;
    }
    let len = data.len() as f64;
    let mut entropy = 0.0;
    for count in freq.iter() {
        if *count > 0 {
            let p = *count as f64 / len;
            entropy -= p * p.log2();
        }
    }
    entropy
}
