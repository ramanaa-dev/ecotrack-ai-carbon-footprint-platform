# 🌱 EcoTrack AI – Real-Time Carbon Footprint Platform

EcoTrack AI is a premium production-ready, full-stack SaaS-style sustainability platform designed to help users measure, track, analyze, forecast, and reduce their carbon footprint. The platform combines a modular Flask API with statistical forecasting engines, gamified community missions, and a glassmorphic React dashboard with Recharts analytics.

---

## 🚀 Key Features

* **Carbon Footprint Calculator:** Tabbed interface with slider inputs measuring transportation, household energy consumption, diet footprints, and waste management.
* **Aggregated Analytics:** Recharts area and pie charts displaying category breakdown splits and carbon history trends over time.
* **ML-Powered Predictions:** Daily averages forecasting for next week and next month using a statistical linear regression trend module.
* **Gamification & Rewards:** Point accumulation system for logging entries, completing community challenges, and earning custom achievements.
* **Sustainability Goals:** Goal tracker with visual progress bars, target increments, status markers, and deadline controls.
* **Community Challenges:** Section to join and claim community challenges such as *No Plastic Week* or *Bicycle Commute*.
* **Dynamic Recommendations:** Rule-based AI advisory engine generating customized suggestions based on user logs.
* **Reporting & Export System:** Instantly generate daily, weekly, or monthly carbon reports as clean download-ready CSV sheets or styled PDFs (using ReportLab).
* **Global Leaderboard:** Standings ranking top users based on earned points and Eco Scores.
* **Admin Dashboard:** Control panel allowing system administrators to oversee global members, wipe profile records, view statistics, and deploy new challenges.

---

## 🛠️ Technology Stack

### Frontend
- **React.js & Vite** for rapid rendering and module reloading
- **Tailwind CSS** with a custom Glassmorphism and Neon styling system
- **React Router v6** for state-guided page navigation
- **Axios** client configured with automatic JWT interceptors
- **Recharts** for interactive responsive analytics charts
- **Framer Motion** for micro-animations and smooth page transitions
- **React Icons** (`react-icons/fa6`, `react-icons/md`)

### Backend
- **Python Flask** API factory structure
- **Flask-JWT-Extended** for stateless JWT token sessions
- **Flask-SQLAlchemy** ORM (configured to run PostgreSQL, falling back to SQLite for local development)
- **ReportLab** for server-side dynamic PDF compilation
- **NumPy & Pandas** for statistical regression predictions
- **Flask-CORS** for secure Cross-Origin sharing

---

## 📁 Project Structure

```
d:/hackthon/Ch3/ECo/
├── backend/
│   ├── app.py                # Server factory, tables setup & data seeding
│   ├── config.py             # App configurations (JWT, DB links)
│   ├── models.py             # SQLAlchemy schemas
│   ├── ml_module.py          # Prediction trend logic
│   ├── requirements.txt      # Backend dependencies
│   └── routes/
│       ├── auth.py           # Auth, Profile & Notifications API
│       ├── carbon.py         # Calculation, Aggregations & Predictions API
│       ├── goals.py          # Goal CRUD API
│       ├── challenges.py     # Challenges & achievements API
│       ├── leaderboard.py    # User rankings ranking API
│       ├── reports.py        # PDF/CSV file exporter API
│       └── admin.py          # Admin statistics & management API
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── index.css         # Tailwind & glassmorphic custom classes
        ├── api.js            # Axios client wrapper
        ├── context/
        │   └── AuthContext.jsx # JWT state provider
        ├── components/
        │   ├── Navbar.jsx    # Top header & live notifications panel
        │   ├── Sidebar.jsx   # Side menu & session state controls
        │   ├── ProtectedRoute.jsx
        │   ├── GlassCard.jsx # Reusable glass container wrapper
        │   └── StatCard.jsx  # Glow-accent metric tracker card
        └── pages/
            ├── Login.jsx     # Glowing glass form & forgot pass modal
            ├── Register.jsx  # Grid form with age/location meta
            ├── Profile.jsx   # Profile update & password modifier
            ├── Dashboard.jsx # Stat blocks & Recharts graphs
            ├── Calculator.jsx# Slider tab forms with live math feedback
            ├── Goals.jsx     # Visual target trackers with edit logs
            ├── Challenges.jsx# Claim community badges & challenges
            ├── Leaderboard.jsx# Top podium lists & rankings table
            ├── History.jsx   # Search logs & PDF/CSV buttons
            ├── Predictions.jsx# Linear regression composed graphs
            └── AdminDashboard.jsx # Admin controls, stats & forms
```

---

## 🔒 Environment Variables

### Backend Configuration
Create a `.env` file in the `backend/` directory:
```env
FLASK_APP=app.py
FLASK_ENV=development
JWT_SECRET_KEY=your_custom_jwt_secret_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/ecotrack
```
*Note: If `DATABASE_URL` is omitted, the backend automatically falls back to creating `sqlite:///ecotrack.db` for instant zero-configuration local runs.*

### Frontend Configuration
Create a `.env` file in the `frontend/` directory:
```env
# Optional. Use this only for local development if you want to override the default /api path.
# VITE_API_URL=http://localhost:5000/api
```

---

## ⚙️ Installation & Running Locally

### Backend Setup
1. Open terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python app.py
   ```
   *The Flask backend will boot on `http://localhost:5000` and seed default demo data.*

### Frontend Setup
1. Open a new terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch on `http://localhost:3000` with local proxy routing requests automatically.*

---

## 🌐 API Documentation

### Auth & Notifications
* `POST /api/auth/register` - SignUp user profile
* `POST /api/auth/login` - Verify password & return JWT access token
* `GET /api/auth/profile` - Fetch current user credentials
* `PUT /api/auth/profile` - Edit user profile info
* `PUT /api/auth/change-password` - Update profile security password
* `POST /api/auth/forgot-password` - Trigger password reset procedure
* `GET /api/auth/notifications` - Retrieve alerts feed
* `PUT /api/auth/notifications/<id>/read` - Mark specific notification as read

### Carbon Calculator & Projections
* `POST /api/carbon/calculate` - Log category elements & calculate daily emissions
* `GET /api/carbon/history` - Retrieve logs (with date queries & sorting)
* `GET /api/carbon/latest` - Fetch today's current log
* `GET /api/carbon/stats` - Fetch weekly/monthly statistics & coordinates splits
* `GET /api/carbon/recommendations` - Dynamically fetch custom recommendations
* `GET /api/carbon/predict` - Perform regression forecasting trends

### Goals, Leaderboards & Challenges
* `GET /api/goals` - Fetch goals list
* `POST /api/goals` - Define goal target
* `PUT /api/goals/<id>` - Modify progress or complete goal
* `DELETE /api/goals/<id>` - Delete goal from system
* `GET /api/challenges` - Fetch active community challenges
* `POST /api/challenges/<id>/join` - Enlist user in a challenge
* `POST /api/challenges/<id>/complete` - Verify completed challenge & award points
* `GET /api/challenges/achievements` - List badges earned status
* `GET /api/leaderboard` - Fetch user rank listings

### Exporter & Administration
* `GET /api/reports/export` - Export history (`format=pdf|csv`, `type=weekly|monthly|all`)
* `GET /api/admin/stats` - Platform aggregate analytics (Admin only)
* `GET /api/admin/users` - Fetch user list (Admin only)
* `DELETE /api/admin/users/<id>` - Erase profile card (Admin only)
* `POST /api/admin/challenges` - Launch a community challenge (Admin only)

---

## 🖥️ Demo Credentials

The platform seeds sample credentials on launch. Log in with:

| Account Role | Username / Email | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@ecotrack.ai` | `admin123` |
| **Standard Eco Warrior** | `user@ecotrack.ai` | `user123` |

*The user account pre-logs 10 days of dummy entries to populate analytics dashboards and ML forecast models instantly.*

---

## ☁️ Deployment Guide (Vercel & Render)

This project is structured as a monorepo. Follow these exact settings to deploy successfully.

### 1. Backend Deployment (Render)
1. Sign in to [Render](https://render.com) and click **New > Web Service**.
2. Connect your GitHub repository.
3. In the creation wizard, configure the following:
   - **Name:** `ecotrack-backend`
   - **Language:** `Python 3`
   - **Root Directory:** `backend` (This is critical to tell Render to execute inside the `backend` folder)
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
4. Expand the **Advanced** section and add the following **Environment Variables**:
   - `JWT_SECRET_KEY` = *[Any secure random string]*
   - `SECRET_KEY` = *[Any secure random string]*
   - Add a **PostgreSQL Database** on Render, copy its **External Database URL**, and add it as:
     `DATABASE_URL` = *[Your database connection string starting with postgresql://]*
5. Click **Create Web Service**. Wait for the build to finish. Copy your live backend URL (e.g., `https://ecotrack-backend.onrender.com`).

### 2. Frontend Deployment (Vercel)
1. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. In the project setup wizard:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click *Edit* and select the `frontend` folder (This is critical to build the frontend inside `frontend`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand the **Environment Variables** section and add:
   - `BACKEND_URL` = `https://<your-render-backend-name>.onrender.com` *(Use the Render base URL without `/api`; the Vercel proxy adds it automatically.)*
5. Click **Deploy**. Vercel will build and assign you a live link (e.g., `https://ecotrack-frontend.vercel.app`).

*Note: The frontend includes `frontend/vercel.json`, which rewrites navigation routes to `index.html` and forwards `/api/*` requests through a small Vercel proxy to your Render backend.*
