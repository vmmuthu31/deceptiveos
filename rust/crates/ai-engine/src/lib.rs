use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde_json::{json, Value};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/anomalies", get(list_anomalies))
        .route("/profiles", get(list_profiles))
        .route("/predict", get(predict_threat))
}

#[derive(Clone)]
pub struct AppState;

pub async fn list_anomalies() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "anomalies": [],
            "total": 0,
            "threshold": 0.7
        })),
    )
}

pub async fn list_profiles() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "profiles": [],
            "total": 0
        })),
    )
}

pub async fn predict_threat() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(json!({
            "prediction": "normal",
            "confidence": 0.95,
            "model": "isolation-forest-v1"
        })),
    )
}
