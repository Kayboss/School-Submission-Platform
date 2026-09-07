# System Architecture — TaTU Submission Portal

## High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (Vercel)"
        React["React 19 SPA"]
        Zustand["Zustand State"]
        Router["React Router v7"]
        StyledComp["styled-components"]
    end

    subgraph "Supabase Backend"
        Auth["Supabase Auth<br/>(GoTrue)"]
        PostgREST["PostgREST API"]
        Pg["PostgreSQL"]
        Storage["Supabase Storage"]
        RPC["RPC Functions"]
    end

    subgraph "External Services"
        IpApi["ipapi.co<br/>(geolocation)"]
        GFonts["Google Fonts"]
        Vercel["Vercel CDN<br/>(hosting)"]
    end

    React -->|"HTTP/REST"| PostgREST
    React -->|"auth SignUp/In"| Auth
    React -->|"upload/download"| Storage
    React -->|"get_course_enrollments()"| RPC
    React -->|"user-agent + IP"| IpApi
    Vercel -->|"serves SPA"| React
    PostgREST -->|"queries"| Pg
    RPC -->|"SECURITY DEFINER"| Pg
    Auth -->|"JWT session"| PostgREST
    Storage -->|"RLS policies"| Pg
```

## Frontend Modules

| Module | Path | Purpose |
|---|---|---|
| Auth | `/login`, `/signup` | Email/password sign-in and registration |
| Onboarding | `/onboarding` | Pre-study research questionnaire (new students) |
| Dashboard | `/` | Role-switched home (student/lecturer/admin) |
| Courses | `/courses` | Browse catalog, accept/enroll in courses |
| Assignments | `/assignments` | Student view of assignments |
| Submissions | `/submissions` | File upload portal for assignments |
| History | `/history` | Submission history + CSV export |
| Settings | `/settings` | Profile, theme, notification preferences |
| Lecturer | `/lecturer/*` | Submissions grading, assignment management, student roster |
| Admin | `/admin`, `/analytics` | Research data dashboard, analytics |
| Post-Interview | `/post-interview` | Post-usage feedback survey |

## Route Guards (evaluated in order)

1. **CheckAuth** — redirects to `/login` if not authenticated
2. **OnboardingGuard** — redirects students with `onboarding_completed = false` to `/onboarding`
3. **RoleGuard** — restricts routes by role (`admin`, `lecturer`)
4. **DataLoader** — pre-loads courses, assignments, submissions, rubrics before rendering

## Data Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant L as Lecturer
    participant A as Admin
    participant DB as Supabase

    S->>DB: Sign up → auth.users + profiles
    S->>DB: Complete onboarding → research_responses
    S->>DB: Accept course → accepted_courses
    S->>DB: Upload submission → submissions + storage
    L->>DB: Create assignment → assignments
    L->>DB: Grade submission → submissions (score, feedback)
    A->>DB: View analytics → profiles, activity_log, user_sessions
    S->>DB: Complete post-interview → post_interview_responses
```

## Backend Services

| Service | Tables | Purpose |
|---|---|---|
| Supabase Auth | `auth.users` | Email/password authentication, JWT sessions |
| PostgreSQL | 11 public tables | All application data, RLS enforced |
| Storage | 3 buckets | File uploads (submissions, assignments, course images) |
| RPC | `get_course_enrollments()`, `get_course_students()` | Aggregation functions (SECURITY DEFINER) |

## Storage Buckets

| Bucket | Access | Limit | Purpose |
|---|---|---|---|
| `submission-files` | Private | 50 MB | Student assignment uploads |
| `assignment-files` | Public | 50 MB | Lecturer-uploaded materials |
| `course-images` | Public | 5 MB | Course thumbnails/banners |

## Security Layer

- **Row-Level Security (RLS)** enabled on every table
- **Role-based guards** on frontend routes (student / lecturer / admin)
- **`get_my_role()`** — SECURITY DEFINER function for RLS role checks (avoids infinite recursion)
- **`profile_role_guard`** — trigger preventing non-admins from assigning the admin role
- **Anon role** — all write privileges (INSERT/UPDATE/DELETE/TRUNCATE) revoked on every table
- **CSP headers** — strict Content-Security-Policy via `vercel.json`
- **Idle timeout** — auto-logout after 10 minutes of inactivity
- **Error sanitization** — raw Supabase errors mapped to user-friendly messages

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, styled-components, Zustand |
| Routing | React Router DOM v7 |
| Validation | Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Sanitization | DOMPurify |
| Backend | Supabase (PostgreSQL 15, GoTrue, PostgREST, Storage) |
| Hosting | Vercel (production) |
| Repository | GitHub |
