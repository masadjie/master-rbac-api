# Node.js + Mongodb With RBAC (Role Baed Access Control) Restfull API

API backend untuk layanan cloud, otentikasi, RBAC, pembayaran, dan integrasi WhatsApp OTP.

## 🚀 Fitur

- Otentikasi (register, login, Google login, refresh token, logout)
- Manajemen Role & Permission (RBAC)
- Manajemen Layanan & Item
- Integrasi WhatsApp untuk OTP
- Pembayaran via Midtrans

## 📦 Instalasi

1. **Clone repository**
   ```bash
   git clone 
   cd 
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Copy file .env.example ke .env**
   ```bash
   cp .env.example .env
   ```

4. **Edit file `.env` sesuai kebutuhan Anda**

## ⚙️ Contoh .env

```env
PORT=4000
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=

# FOR LOGIN WITH GOOGLE
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# FOR API SEND OTP
WA_API_KEY=
WA_SESSION_URL=
WA_SEND_URL=

# FOR MIDTRANS PAYMENT
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
```

## 🛠️ Menjalankan Aplikasi

- **Development (auto reload)**
  ```bash
  npm run dev
  ```

- **Production**
  ```bash
  npm run prod
  ```

- **Seed data awal**
  ```bash
  npm run seed
  ```

- **Generate JWT Secret**
  ```bash
  npm run generate-secret
  ```

## 📖 Contoh Penggunaan API

### Register (Request OTP via WhatsApp)
```http
POST /api/v1/auth/register
Body:
{
  "email": "user1@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "08123456789"
}
```

### Verify OTP
```http
POST /api/v1/auth/verify-otp
Body:
{
  "userId": "",
  "otp": "123456"
}
```

### Login
```http
POST /api/v1/auth/login
Body:
{
  "email": "user1@example.com",
  "password": "password123"
}
```

### Google Login
```http
POST /api/v1/auth/google-login
Body:
{
  "idToken": ""
}
```

## 📜 License

MIT

> Kontribusi, bug report, dan saran sangat terbuka!  
> Pastikan semua variabel pada `.env` sudah terisi sebelum menjalankan aplikasi.

**Silakan copy-paste ke file `README.md` di repository GitHub Anda!**
