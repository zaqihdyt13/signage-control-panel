# Signage Control Panel

A full-stack web application for managing digital signage devices and content with real-time monitoring using WebSocket.

Built as part of a Full Stack Developer take-home assessment.

## Features

- **Device Management** — Create, update, delete, and monitor signage devices.
- **Content Management** — Manage images, videos, and URL-based content with Supabase Storage.
- **Real-Time Monitoring** — Track device online/offline status using Socket.IO without refreshing.
- **Push Content** — Send selected content to a specific device in real time.
- **Device Simulator** — Display assigned content through a browser-based client.
- **Authentication** — Secure admin access using Supabase Auth (JWT) and device-specific tokens.
- **Auto Reconnection** — Automatically reconnect devices and restore their active content.

## Tech Stack

| Frontend               | Backend           | Database & Services |
| ---------------------- | ----------------- | ------------------- |
| React + Vite           | Node.js + Express | Supabase PostgreSQL |
| Tailwind CSS + daisyUI | Socket.IO         | Supabase Auth       |
| Axios                  | Zod + Multer      | Supabase Storage    |

## Getting Started

### Prerequisites

- Node.js and npm
- A Supabase account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install Dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd ../client
npm install
```

### 3. Supabase Setup

1. Create a new project in [Supabase](https://supabase.com).
2. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
3. Create a **public Storage bucket** named `signage-contents`.
4. Create an admin user through **Authentication → Users**.
5. Register the admin user by running the following SQL in the SQL Editor:

```sql
INSERT INTO public.admin_profiles (user_id)
VALUES ('YOUR_ADMIN_USER_UUID');
```

Replace `YOUR_ADMIN_USER_UUID` with the UUID from Supabase Authentication.

### 4. Configure Environment Variables

Create `.env` files inside both `server` and `client` directories using the provided `.env.example` files.

Configure the Supabase credentials, API URL, and other required environment variables.

### 5. Run the Application

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Open the URL provided by Vite.

## Usage

1. Log in to the admin dashboard.
2. Create a device and generate its authentication token.
3. Add or upload content through the Content Library.
4. Open the Device Simulator and enter its token.
5. Push content to the device and monitor its status in real time.

## Notes

- The device client is browser-based, not Electron.
- Playlist functionality is not implemented.
- Advanced security hardening and automated testing are potential future improvements.

## Screenshots

### Dashboard
<img width="959" height="493" alt="image" src="https://github.com/user-attachments/assets/6e80ea98-3a9c-4652-8d05-0cb219c0e03d" />

### Device Management
<img width="948" height="494" alt="image" src="https://github.com/user-attachments/assets/a72813b1-12a7-4047-bb01-45c9d4da7390" />

### Content Management
<img width="945" height="494" alt="image" src="https://github.com/user-attachments/assets/911293c7-c005-4854-b941-cf096f55adda" />
