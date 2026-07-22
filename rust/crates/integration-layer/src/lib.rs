use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde_json::{json, Value};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/sigma", get(list_sigma_rules).post(generate_sigma_rule))
        .route("/stix", get(list_stix_objects))
        .route("/taxii", get(taxii_endpoint))
        .route("/alerts", post(forward_alert))
}

#[derive(Clone)]
pub struct AppState;

pub async fn list_sigma_rules() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "rules": [],
            "total": 0
        })),
    )
}

pub async fn generate_sigma_rule(Json(_payload): Json<Value>) -> impl IntoResponse {
    (
        StatusCode::CREATED,
        Json(json!({
            "id": "sigma-rule-001",
            "title": "Suspicious SSH Login Pattern",
            "status": "generated",
            "rule": json!({
                "title": "Suspicious SSH Login Pattern",
                "id": "ciphernest-generated-001",
                "status": "experimental",
                "logsource": {
                    "product": "ssh",
                    "service": "sshd"
                },
                "detection": {
                    "selection": {
                        "event_id": "601
                    },
                    "condition": "selection"
                }
            })
        })),
    )
}

pub async fn list_stix_objects() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "objects": [],
            "total": 0
        })),
    )
}

pub async fn taxii_endpoint() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "status": "ok",
            "version": "2.1"
        })),
    )
}

pub async fn forward_alert(Json(payload): Json<Value>) -> impl IntoResponse {
    tracing::info!("Forwarding alert to SIEM: {:?}", payload);
    (
        StatusCode::ACCEPTED,
        Json(json!({
            "status": "forwarded",
            "timestamp": chrono::Utc::now().to_rfc3339()
        })),
    )
}
