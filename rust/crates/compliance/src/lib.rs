use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde_json::{json, Value};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/audit", get(list_audit_events))
        .route("/report", get(generate_report))
        .route("/compliance", get(compliance_status))
}

#[derive(Clone)]
pub struct AppState;

pub async fn list_audit_events() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "events": [],
            "total": 0
        })),
    )
}

pub async fn generate_report() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "report_id": "report-001",
            "generated_at": chrono::Utc::now().to_rfc3339(),
            "frameworks": {
                "soc2": "not_started",
                "iso27001": "not_started",
                "gdpr": "not_started"
            }
        })),
    )
}

pub async fn compliance_status() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "soc2": {
                "status": "not_configured",
                "controls_implemented": 0,
                "controls_total": 64
            },
            "iso27001": {
                "status": "not_configured",
                "controls_implemented": 0,
                "controls_total": 93
            },
            "gdpr": {
                "status": "not_configured",
                "controls_implemented": 0,
                "controls_total": 30
            }
        })),
    )
}
