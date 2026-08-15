use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use serde_json::{Value, json};
use uuid::Uuid;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_honeypots).post(create_honeypot))
        .route("/:id", get(get_honeypot))
        .route("/:id/start", post(start_honeypot))
        .route("/:id/stop", post(stop_honeypot))
}

#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::Pool<sqlx::Postgres>,
}

pub async fn list_honeypots(State(state): State<AppState>) -> impl IntoResponse {
    let rows = sqlx::query_as::<_, HoneypotRow>(
        "SELECT id, name, honeypot_type, status, container_id, ip_address, started_at, created_at FROM honeypots ORDER BY created_at DESC",
    )
    .fetch_all(&state.db)
    .await;

    match rows {
        Ok(rows) => {
            let honeypots: Vec<Value> = rows
                .iter()
                .map(|r| {
                    json!({
                        "id": r.id,
                        "name": r.name,
                        "type": r.honeypot_type,
                        "status": r.status,
                        "container_id": r.container_id,
                        "ip_address": r.ip_address,
                        "started_at": r.started_at
                    })
                })
                .collect();
            (StatusCode::OK, Json(json!({ "honeypots": honeypots })))
        }
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        ),
    }
}

pub async fn create_honeypot(
    State(state): State<AppState>,
    Json(payload): Json<Value>,
) -> impl IntoResponse {
    let name = payload
        .get("name")
        .and_then(|v| v.as_str())
        .unwrap_or("unnamed");
    let honeypot_type = payload
        .get("type")
        .and_then(|v| v.as_str())
        .unwrap_or("cowrie-ssh");

    let id = Uuid::new_v4();

    let result = sqlx::query(
        "INSERT INTO honeypots (id, name, honeypot_type, status) VALUES ($1, $2, $3, 'stopped')",
    )
    .bind(id)
    .bind(name)
    .bind(honeypot_type)
    .execute(&state.db)
    .await;

    match result {
        Ok(_) => (
            StatusCode::CREATED,
            Json(json!({
                "id": id.to_string(),
                "status": "created",
                "message": "Honeypot created successfully"
            })),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        ),
    }
}

pub async fn get_honeypot(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let row = sqlx::query_as::<_, HoneypotRow>(
        "SELECT id, name, honeypot_type, status, container_id, ip_address, started_at, created_at FROM honeypots WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await;

    match row {
        Ok(Some(r)) => (
            StatusCode::OK,
            Json(json!({
                "id": r.id,
                "name": r.name,
                "type": r.honeypot_type,
                "status": r.status,
                "container_id": r.container_id,
                "ip_address": r.ip_address,
                "started_at": r.started_at
            })),
        ),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Honeypot not found" })),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        ),
    }
}

pub async fn start_honeypot(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let result =
        sqlx::query("UPDATE honeypots SET status = 'running', started_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&state.db)
            .await;

    match result {
        Ok(r) if r.rows_affected() > 0 => (
            StatusCode::OK,
            Json(json!({ "id": id.to_string(), "status": "running" })),
        ),
        Ok(_) => (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Honeypot not found" })),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        ),
    }
}

pub async fn stop_honeypot(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let result = sqlx::query("UPDATE honeypots SET status = 'stopped' WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await;

    match result {
        Ok(r) if r.rows_affected() > 0 => (
            StatusCode::OK,
            Json(json!({ "id": id.to_string(), "status": "stopped" })),
        ),
        Ok(_) => (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Honeypot not found" })),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": e.to_string() })),
        ),
    }
}

#[derive(sqlx::FromRow)]
pub struct HoneypotRow {
    pub id: Uuid,
    pub name: String,
    pub honeypot_type: String,
    pub status: String,
    pub container_id: Option<String>,
    pub ip_address: Option<String>,
    pub started_at: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}
