# Root Cause: CallbackRouteError - "Check sett"... is not valid JSON

## Tóm tắt

Lỗi xảy ra khi Auth.js gọi `https://accounts.spotify.com/api/token` để đổi authorization code lấy access token. Spotify **trả về response không phải JSON** (có thể là HTML hoặc plain text bắt đầu bằng "Check sett..."), nên `response.json()` trong oauth4webapi bị lỗi `SyntaxError`.

## Luồng lỗi

```
User authorize xong → Spotify redirect về /api/auth/callback/spotify?code=...&state=...
→ Auth.js gọi POST https://accounts.spotify.com/api/token
→ Spotify trả về body bắt đầu "Check sett..." (không phải JSON)
→ oauth4webapi: getResponseJsonBody() → response.json() → SyntaxError
→ CallbackRouteError
```

## Root cause chính

### 1. Spotify trả về HTML/plain text thay vì JSON

- API token của Spotify bình thường trả JSON: `{"access_token": "...", "token_type": "Bearer", ...}` hoặc lỗi `{"error": "invalid_client", "error_description": "..."}`
- Khi nhận "Check sett...", nhiều khả năng là:
  - Trang lỗi HTML (ví dụ: "Check settings in your Spotify Developer Dashboard")
  - Bị chặn/rate limit và trả HTML
  - Cấu hình app sai làm Spotify trả trang thông báo thay vì JSON

### 2. Xung đột PKCE + Client Secret (nghi vấn cao)

Auth.js mặc định dùng **cả hai**:
- **PKCE**: `code_challenge`, `code_challenge_method` ở authorize; `code_verifier` ở token
- **Client secret**: `Authorization: Basic base64(client_id:client_secret)` ở token

Trong khi Spotify có hai luồng riêng:

| Flow | Token request |
|------|---------------|
| **Authorization Code** (có secret) | Body: grant_type, code, redirect_uri. Header: `Authorization: Basic`. Không có `code_verifier` |
| **PKCE** (không secret) | Body: client_id, grant_type, code, redirect_uri, code_verifier. Không dùng `Authorization` với client_secret |

Auth.js đang gửi cả `code_verifier` và `Authorization: Basic` trong cùng một request. Điều này có thể khiến Spotify trả lỗi hoặc trang lỗi không chuẩn (HTML) thay vì JSON.

### 3. Chính sách mới của Spotify (2025)

Từ blog Spotify (Feb 2025):
- App tạo sau **09/04/2025** không còn hỗ trợ **HTTP** cho redirect URI
- Chỉ chấp nhận HTTPS (trừ một số ngoại lệ)

Nếu app của bạn tạo sau ngày đó mà dùng `http://127.0.0.1:3000`, Spotify có thể chặn và trả trang lỗi HTML thay vì JSON.

## Khuyến nghị xử lý

1. **Tắt PKCE cho Spotify** – dùng **Authorization Code thuần** (chỉ state), vì đây là server-side Next.js có thể lưu client_secret an toàn.
2. **Kiểm tra lại Client ID / Client Secret** trên Spotify Dashboard.
3. **Thêm debug** để xem chính xác response từ Spotify (status, headers, body) trước khi parse JSON.
