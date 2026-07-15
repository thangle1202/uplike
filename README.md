# UpLike

Website dịch vụ tăng tương tác mạng xã hội — Facebook, TikTok, Instagram, Threads, YouTube.

## Tech stack

- **Frontend:** Vite + React + TypeScript + Tailwind CSS
- **Backend:** Express.js (Node.js) + JSON file storage

## Chạy development

```bash
npm install
npm run dev:full    # Frontend :8080 + Backend :3000
```

## Order flow & trạng thái

| Trạng thái | Mô tả |
|-----------|--------|
| `ordered` | Đã tạo đơn, chờ thanh toán |
| `processing` | Đã thanh toán, đang xử lý |
| `done` | Hoàn thành |
| `cancelled` | Đã hủy |

1. Chọn dịch vụ → nhập thông tin → **Mua ngay** → tạo đơn (`ordered`)
2. **Thanh toán tự động:**
   - **User đăng nhập (đủ số dư ví):** trừ ví ngay → `processing`
   - **Khách / không đủ ví:** chuyển sang trang QR thanh toán → xác nhận → `processing`
3. Admin cập nhật trạng thái → `done`

## Tài khoản demo

- Email: `demo@uplike.com`
- Password: `demo123`
- Số dư ví: 500,000 VND

## Admin

- URL: `/admin`
- Passcode: `admin123` (cấu hình qua `ADMIN_PASSCODE` trong `.env`)
- Quản lý: đơn hàng, users, nạp tiền, servers từng dịch vụ

## API chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/orders` | Tạo đơn |
| GET | `/api/payments/order/:id/qr` | QR thanh toán (mock) |
| POST | `/api/payments/order/:id/confirm-guest` | Xác nhận CK khách |
| POST | `/api/payments/order/:id/pay-wallet` | Thanh toán ví |
| POST | `/api/wallet/deposits` | Yêu cầu nạp tiền |
| PATCH | `/api/orders/:id/status` | Admin cập nhật trạng thái |

## Cấu hình

Copy `.env.example` → `.env`:

```
PORT=3000
ADMIN_PASSCODE=admin123
AUTH_SALT=uplike-dev-salt
```

Thông tin ngân hàng admin: `backend/data/config.json`

## Deploy lên Railway

### 1. Push lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh auth login
gh repo create uplike --public --source=. --remote=origin --push
```

### 2. Deploy trên Railway

1. Vào [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Chọn repo `uplike`
3. Thêm **Variables** trong tab Settings → Variables:

| Variable | Mô tả |
|----------|--------|
| `ADMIN_PASSCODE` | Mật khẩu admin (đổi khác `admin123` khi production) |
| `AUTH_SALT` | Salt băm mật khẩu (chuỗi ngẫu nhiên dài) |

Railway tự gán `PORT` — không cần set.

4. Railway sẽ chạy `npm run build` rồi `npm start` (Express phục vụ cả API + frontend từ `dist/`)

### Lưu ý production

- Dữ liệu lưu trong `backend/data/*.json` — trên Railway filesystem **không bền** (mất khi redeploy). Cân nhắc gắn [Railway Volume](https://docs.railway.com/guides/volumes) mount vào `/app/backend/data` nếu cần giữ dữ liệu lâu dài.
- Đổi `ADMIN_PASSCODE` và `AUTH_SALT` trước khi public.
