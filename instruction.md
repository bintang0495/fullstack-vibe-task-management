# Spesifikasi Teknis: Weekly Task Scheduler

## 1. Latar Belakang & Tujuan

Aplikasi ini dibuat untuk pekerja yang butuh sistem pengingat jadwal rutin mingguan yang lebih andal dibanding catatan pribadi (kertas/notes app), karena catatan manual rawan hilang, tertinggal, atau tidak konsisten.

Masalah utama yang diselesaikan:
1. Jadwal rutin pekanan tidak tersimpan di tempat yang konsisten dan mudah diakses.
2. Tidak ada cara melacak apakah task yang dijadwalkan benar-benar **dikerjakan** atau hanya jadi rencana yang tidak pernah dieksekusi.
3. Tidak ada mekanisme untuk menambah kegiatan **khusus** di minggu tertentu (misal: meeting, deadline project) di luar rutinitas biasa.

Fungsi inti aplikasi:
- Menyimpan **master task rutin** (berulang di hari-hari tertentu tiap minggu).
- Memungkinkan **custom task** (task sekali pakai di tanggal tertentu, tidak berulang).
- Menampilkan **todo list per hari/minggu** dari gabungan master task + custom task.
- Mencatat status pengerjaan (done/not done) setiap kali task muncul di suatu tanggal.
- Menyediakan **dashboard evaluasi** — task mana yang rajin dikerjakan vs. yang hanya jadi rencana kosong — dengan filter rentang waktu.

---

## 2. Tech Stack (WAJIB, jangan diganti)

| Layer | Teknologi |
|---|---|
| Backend | Express.js |
| Query builder | Knex.js (JANGAN pakai ORM seperti Sequelize/Prisma) |
| Database | PostgreSQL |
| Frontend | React + Tailwind CSS |
| Auth | JWT + bcrypt untuk hashing password |
| Containerization | Docker + Docker Compose (service: `api`, `web`, `db`) |

---

## 3. Skema Database

### `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid / serial PK | |
| email | varchar, unique, not null | |
| password_hash | varchar, not null | hasil bcrypt, salt rounds = 10 |
| created_at | timestamp, default now() | |

### `master_tasks` (task rutin/berulang)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| user_id | FK -> users.id | |
| title | varchar, not null | |
| description | text, nullable | |
| time | time, not null | jam pelaksanaan |
| is_active | boolean, default true | soft-disable tanpa hapus histori |
| created_at | timestamp | |

### `master_task_days` (hari-hari task rutin berulang — relasi many-to-many)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| master_task_id | FK -> master_tasks.id | |
| day_of_week | smallint | 0=Minggu ... 6=Sabtu |

> Satu master task bisa punya banyak baris di sini (multi-select hari).

### `custom_tasks` (task khusus, sekali pakai di tanggal tertentu)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| user_id | FK -> users.id | |
| title | varchar, not null | |
| description | text, nullable | |
| time | time, not null | |
| task_date | date, not null | tanggal spesifik pelaksanaan |
| created_at | timestamp | |

### `task_logs` (histori status pengerjaan — sumber data dashboard)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | PK | |
| user_id | FK -> users.id | |
| task_type | enum('master','custom') | |
| task_id | integer | FK ke master_tasks.id atau custom_tasks.id (tergantung task_type) |
| task_date | date, not null | tanggal kemunculan task ini |
| status | enum('done','not_done'), default 'not_done' | |
| completed_at | timestamp, nullable | diisi saat user centang selesai |

> **Constraint penting:** unique (`user_id`, `task_type`, `task_id`, `task_date`) — satu task hanya punya satu log per tanggal.
>
> **Logika pembuatan log:** row di `task_logs` dibuat otomatis (lazy, saat halaman "Task Hari Ini" dibuka dan belum ada row untuk tanggal tsb) ATAU via scheduled job harian. Pilih salah satu — untuk versi awal, cukup lazy-create saat GET task hari ini dipanggil.

---

## 4. Fitur & Halaman

### 4.1 Autentikasi
- Register: email + password → hash pakai bcrypt → simpan ke `users`.
- Login: verifikasi bcrypt, generate JWT, simpan token di client (httpOnly cookie atau localStorage — pakai httpOnly cookie untuk keamanan lebih baik).
- Semua endpoint selain register/login wajib pakai middleware verifikasi JWT.
- Tombol **Logout** di pojok kanan atas header → hapus token/cookie, redirect ke halaman login.

### 4.2 Layout
- **Header**: nama aplikasi di kiri, tombol Logout di kanan atas.
- **Sidebar**: menu navigasi — Task Hari Ini, Jadwal Mingguan, Setup Task Rutin, Task Custom, Dashboard.

### 4.3 Setup Task Rutin (Master Task)
- Form: judul, deskripsi, jam, checkbox multi-select hari (Senin–Minggu).
- List semua master task dengan aksi edit & nonaktifkan (soft delete via `is_active`).

### 4.4 Task Custom
- Form: judul, deskripsi, jam, **tanggal spesifik** (bukan hari berulang).
- Bisa ditambahkan langsung dari halaman ini atau dari halaman Jadwal Mingguan (tombol "+ Tambah task khusus minggu ini").

### 4.5 Task Hari Ini
- Menampilkan todo list gabungan: master task yang `day_of_week`-nya cocok dengan hari ini + custom task yang `task_date`-nya = hari ini.
- Setiap item punya checkbox → saat dicentang, update `task_logs.status = 'done'` dan `completed_at = now()`.

### 4.6 Jadwal Mingguan
- Tampilan grid 7 hari (Senin–Minggu) dalam satu minggu, isi tiap hari = master task yang jadwalnya jatuh di hari itu + custom task di tanggal itu.
- Navigasi minggu sebelumnya / berikutnya.

### 4.7 Dashboard Evaluasi
- Filter rentang waktu: **7 hari, 14 hari, 30 hari, > 30 hari (custom date range)** dihitung mundur dari hari ini.
- Chart: perbandingan jumlah task `done` vs `not_done` per task (bar chart), agar terlihat task mana yang "cuma rencana" vs yang benar-benar konsisten dijalankan.
- Tampilkan juga persentase completion rate per master task.

---

## 5. API Endpoints (ringkas)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/master-tasks
POST   /api/master-tasks
PUT    /api/master-tasks/:id
DELETE /api/master-tasks/:id        (soft delete -> is_active = false)

GET    /api/custom-tasks?date=YYYY-MM-DD
POST   /api/custom-tasks
PUT    /api/custom-tasks/:id
DELETE /api/custom-tasks/:id

GET    /api/tasks/today
GET    /api/tasks/week?start=YYYY-MM-DD
PATCH  /api/task-logs/:id           (update status done/not_done)

GET    /api/dashboard/summary?range=7|14|30|custom&from=&to=
```

---

## 6. Docker Compose (struktur yang diharapkan)

```
docker-compose.yml
├── service: db (postgres:16, volume persisten, env: POSTGRES_DB/USER/PASSWORD)
├── service: api (build dari ./backend, depends_on: db, env: DATABASE_URL, JWT_SECRET)
└── service: web (build dari ./frontend, depends_on: api)
```

- Backend pakai Knex migrations (`knex migrate:latest`) untuk membuat semua tabel di atas — jangan bikin skema manual di luar migration.
- Sediakan file `.env.example` untuk kedua service (api & web).

---

## 7. Catatan untuk Developer/AI yang Mengerjakan

- Kerjakan bertahap: (1) migration + schema DB, (2) auth, (3) CRUD master & custom task, (4) task hari ini + logging, (5) jadwal mingguan, (6) dashboard, (7) docker compose.
- Validasi input di backend (bukan cuma di frontend) — minimal: email format, password minimal 8 karakter, field wajib tidak boleh kosong.
- Jangan simpan password dalam bentuk apapun selain hash bcrypt.
- Gunakan environment variable untuk semua secret (JWT_SECRET, DB credentials) — jangan hardcode.