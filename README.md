# TaTU Submission Portal

An online submission system designed to improve storage and retrieval of students' academic files at Tamale Technical University. Built as part of a research study: *"Designing an Online Submission System to Improve Storage and Retrieval of Students' Academic Files."*

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (SPA)                      │
│  React 19 · Vite 8 · styled-components · Zustand 5      │
│  Deployed on Vercel (https://tatu-submission-portal.vercel.app) │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│                    Supabase Backend                      │
│  PostgreSQL 15 · PostgREST · GoTrue Auth · Storage       │
│  Project: Submission Platform (fjnhnajjbofjeqgoqxmm)     │
│  Hosted on Supabase Cloud (AWS us-east-1)                │
└─────────────────────────────────────────────────────────┘
```

**Authentication flow:** Supabase GoTrue issues JWTs on login/signup → client stores user in Zustand (persisted to localStorage) → RLS policies on every table enforce row-level access using `auth.uid()` → Supabase Edge Functions not used (all operations are client-side via `@supabase/supabase-js`).

**Role system:** Three roles — `student`, `lecturer`, `admin`. Admin role can only be assigned by other admins (enforced by database trigger `prevent_profile_role_escalation`). Frontend routes are guarded by `RoleGuard` component.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, React Router 7 | SPA with role-based routing |
| Build | Vite 8, TypeScript 6 | Fast dev server + production builds |
| Styling | styled-components 6 | CSS-in-JS with theme support |
| State | Zustand 5 | Client state (stores for auth, courses, submissions, assignments, rubrics, uploads, toasts, errors) |
| Charts | Recharts 3 | Analytics dashboards (pie, bar, radar, line charts) |
| Icons | Lucide React | UI icon library |
| Validation | Zod 4 | Schema validation |
| Sanitization | DOMPurify 3 | HTML sanitization in MarkdownEditor |
| Auth | Supabase GoTrue | Email/password authentication with JWT |
| Database | Supabase PostgreSQL | All data storage with RLS |
| Storage | Supabase Storage | File uploads (submissions, assignments, course images) |
| Hosting | Vercel | Static site hosting with security headers |

---

## Database Tables

### `profiles`
User accounts — one row per user, linked to Supabase Auth via `id`.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | — | FK → `auth.users.id` |
| `name` | text | NO | — | Display name |
| `email` | text | NO | — | Email address |
| `role` | text | NO | — | `student`, `lecturer`, or `admin` |
| `institution` | text | YES | `'Tamale Technical University'` | Institution name |
| `student_id` | text | YES | — | Student ID (e.g. TATU/24/0001) |
| `avatar_url` | text | YES | — | Profile picture URL |
| `created_at` | timestamptz | YES | `now()` | Account creation time |
| `notification_preferences` | jsonb | YES | `{"sms":false,"email":true,"gradeAlerts":true}` | Notification settings |
| `theme` | text | YES | `'light'` | UI theme |
| `onboarding_completed` | boolean | YES | `false` | Whether pre-interview questionnaire is done |
| `post_interview_completed` | boolean | YES | `false` | Whether post-interview questionnaire is done |

### `courses`
Courses available on the platform.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint (serial) | NO | — | Primary key |
| `code` | text | NO | — | Course code (e.g. GCD 266) |
| `name` | text | NO | — | Course name |
| `instructor` | text | NO | — | Lecturer name |
| `accent` | text | YES | `'#b35a38'` | Theme color |
| `credits` | text | YES | `'3.0'` | Credit hours |
| `schedule` | text | YES | — | Class schedule |
| `image` | text | YES | — | Course image URL |
| `user_id` | uuid | YES | — | FK → lecturer who created it |
| `attachments` | jsonb | YES | `'[]'` | Attached files (JSON array) |

### `accepted_courses`
Student enrollment — maps students to courses they've enrolled in.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `user_id` | uuid | NO | — | FK → `profiles.id` (student) |
| `course_id` | bigint | NO | — | FK → `courses.id` |
| `accepted_at` | timestamptz | YES | `now()` | Enrollment timestamp |

**Unique constraint:** `(user_id, course_id)` — a student can only enroll once per course.

### `assignments`
Assignments posted by lecturers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text | NO | `'assign-' \|\| gen_random_uuid()` | Primary key |
| `course_code` | text | NO | — | FK → `courses.code` |
| `title` | text | NO | — | Assignment title |
| `description` | text | YES | — | Assignment description (markdown) |
| `due_date` | timestamptz | NO | — | Submission deadline |
| `submission_types` | jsonb | YES | `{"video":false,"project":false,"document":true}` | Allowed submission types |
| `max_size` | integer | YES | `10` | Max file size in MB |
| `allowed_extensions` | text[] | YES | `'{.pdf}'` | Allowed file extensions |
| `lecturer_name` | text | YES | — | Name of the posting lecturer |
| `late_penalty` | integer | YES | `0` | Late submission penalty (percentage) |
| `allow_resubmission` | boolean | YES | `false` | Whether resubmissions are allowed |
| `max_resubmissions` | integer | YES | `0` | Maximum number of resubmissions |
| `created_at` | timestamptz | YES | `now()` | Creation timestamp |
| `user_id` | uuid | YES | — | FK → `profiles.id` (lecturer) |
| `attachments` | jsonb | YES | `'[]'` | Attached files (JSON array) |

### `submissions`
Student submissions for assignments.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text | NO | `'TaTU-' \|\| upper(md5(random()))` | Primary key |
| `assignment_id` | text | NO | — | FK → `assignments.id` |
| `course_code` | text | NO | — | Course code |
| `assignment_title` | text | NO | — | Denormalized assignment title |
| `student_name` | text | NO | — | Student's display name |
| `student_id` | text | YES | — | Student ID |
| `user_id` | uuid | YES | — | FK → `profiles.id` |
| `timestamp` | timestamptz | YES | `now()` | Submission time |
| `is_late` | boolean | YES | `false` | Whether submitted after due date |
| `time_discrepancy` | text | YES | — | Time difference from deadline |
| `files` | jsonb | YES | `'[]'` | Array of `{name, size, type, url}` |
| `video_link` | text | YES | — | YouTube/Vimeo/Drive embed URL |
| `status` | text | YES | `'Pending'` | `Pending`, `Graded`, etc. |
| `score` | integer | YES | — | Grade (0–100) |
| `feedback` | text | YES | — | Lecturer feedback |
| `rubric_scores` | jsonb | YES | — | Per-criterion rubric scores |
| `versions` | jsonb | YES | `'[]'` | Version history |
| `semester` | text | YES | — | Academic semester |
| `hash` | text | YES | — | File hash for deduplication |
| `created_at` | timestamptz | YES | `now()` | Creation timestamp |

**RLS:** Students can only insert submissions for courses they're enrolled in. Lecturers can update submissions for their own courses. Admins can delete any submission.

### `rubrics`
Grading rubrics attached to assignments.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | text | NO | `'rubric-' \|\| gen_random_uuid()` | Primary key |
| `assignment_id` | text | NO | — | FK → `assignments.id` |
| `criteria` | jsonb | NO | `'[]'` | Array of `{name, description, maxScore}` |
| `created_at` | timestamptz | YES | `now()` | Creation timestamp |

### `activity_log`
Audit trail of user actions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint (serial) | NO | — | Primary key |
| `user_id` | uuid | YES | — | FK → `profiles.id` |
| `action` | text | NO | — | Action type (LOGIN, SUBMIT, GRADE, etc.) |
| `entity_type` | text | YES | — | Entity type (assignment, submission, etc.) |
| `entity_id` | text | YES | — | Entity ID |
| `metadata` | jsonb | YES | `'{}'` | Additional context |
| `user_agent` | text | YES | — | Browser user agent |
| `created_at` | timestamptz | YES | `now()` | Timestamp |

**RLS:** Users can only insert rows where `auth.uid() = user_id`.

### `user_sessions`
Session tracking for analytics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint (serial) | NO | — | Primary key |
| `user_id` | uuid | NO | — | FK → `profiles.id` |
| `login_at` | timestamptz | YES | `now()` | Login timestamp |
| `logout_at` | timestamptz | YES | — | Logout timestamp |
| `user_agent` | text | YES | — | Browser user agent |
| `duration_seconds` | integer | YES | — | Session duration |
| `metadata` | jsonb | YES | `'{}'` | Additional info |

### `research_responses`
Pre-interview questionnaire responses (onboarding).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | NO | — | FK → `profiles.id` |
| `section` | text | NO | — | Section A (demographics), B (storage), C (likert) |
| `question_key` | text | NO | — | Question identifier (e.g. `gender`, `storageMethod`, `likert_0`) |
| `answer` | text | NO | — | Student's answer |
| `created_at` | timestamptz | YES | `now()` | Submission timestamp |

### `post_interview_responses`
Post-interview questionnaire responses.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | NO | — | FK → `profiles.id` |
| `role` | text | NO | `'student'` | Respondent role |
| `section` | text | NO | — | Section identifier |
| `question_key` | text | NO | — | Question identifier |
| `answer` | text | NO | — | Answer text |
| `created_at` | timestamptz | YES | `now()` | Submission timestamp |

### `notifications`
In-app notifications for users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint (serial) | NO | — | Primary key |
| `user_id` | uuid | NO | — | FK → `profiles.id` |
| `type` | text | NO | — | Notification type |
| `title` | text | NO | — | Notification title |
| `message` | text | YES | — | Notification body |
| `course_code` | text | YES | — | Related course |
| `read` | boolean | YES | `false` | Read status |
| `created_at` | timestamptz | YES | `now()` | Creation timestamp |

---

## Storage Buckets

| Bucket | Public | Max Size | Allowed MIME Types |
|--------|--------|----------|-------------------|
| `submission-files` | No | 50 MB | PDF, Word, PowerPoint, Excel, plain text, CSV, ZIP, JPEG, PNG, GIF, MP4, WebM |
| `assignment-files` | Yes | 50 MB | PDF, Word, PowerPoint, Excel, plain text, CSV, ZIP, JPEG, PNG, GIF |
| `course-images` | Yes | 5 MB | JPEG, PNG, GIF, WebP |

**Storage paths:**
- Submissions: `submissions/{assignment_id}/{user_id}/{filename}`
- Assignment files: `assignments/{course_code}/{user_id}/{filename}`
- Course images: `courses/{course_code}/image`

---

## Security

### Row-Level Security (RLS) Policies

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Users see own profile; admins see all | Users insert own profile | Users update own profile; admins change roles | Admins can delete profiles |
| `courses` | All authenticated users | Lecturers + admins | Lecturers + admins | Lecturers + admins |
| `accepted_courses` | All authenticated users | Students enroll themselves | — | Students unenroll themselves |
| `assignments` | All authenticated users | Lecturers + admins | Lecturers + admins | Lecturers + admins (own courses) |
| `submissions` | Students see own; lecturers see course submissions | Students only (must be enrolled in course) | Lecturers (own courses) + admins | Lecturers + admins |
| `rubrics` | Authenticated users | — | — | — |
| `activity_log` | Users see own | Users insert own (`auth.uid() = user_id`) | — | — |
| `user_sessions` | All authenticated users | All authenticated users | — | — |
| `research_responses` | All authenticated users | All authenticated users | — | — |
| `post_interview_responses` | All authenticated users | All authenticated users | — | — |
| `notifications` | All authenticated users | — | — | — |

### Security Functions

| Function | Purpose | Security |
|----------|---------|----------|
| `get_my_role()` | Returns current user's role | `SECURITY DEFINER`, `search_path = public`, revoked from `anon` and `PUBLIC` |
| `get_course_enrollments(course_id)` | Returns enrollment count | `SECURITY DEFINER`, revoked from `anon` and `PUBLIC` |
| `get_course_students(course_id)` | Returns enrolled student IDs | `SECURITY DEFINER`, revoked from `anon` and `PUBLIC` |
| `rls_auto_enable()` | Auto-enables RLS on new tables | `SECURITY DEFINER`, revoked from `anon` and `PUBLIC` |

### Database Triggers

| Trigger | Purpose |
|---------|---------|
| `prevent_profile_role_escalation` | Blocks non-admin users from setting `role = 'admin'` on INSERT or UPDATE (uses `IS DISTINCT FROM` for NULL safety) |

### Security Headers (Vercel)

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co; media-src 'self' blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co https://ipapi.co; frame-src https://www.youtube.com https://player.vimeo.com https://drive.google.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |

### Other Security Measures

- **Input sanitization:** DOMPurify sanitizes HTML output in MarkdownEditor
- **Iframe sandboxing:** Video embeds use `sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"` with `referrerpolicy="no-referrer"`
- **Auth error mapping:** Raw Supabase error messages are replaced with friendly messages (prevents schema leakage)
- **Minimal localStorage:** Only `{id, name, role}` persisted — no PII, no session IDs
- **Idle logout:** Auto-logout after 10 minutes of inactivity
- **HIBP password check:** Configurable in Supabase dashboard (not SQL-settable)

---

## Project Structure

```
├── index.html                          # Entry point
├── package.json                        # Dependencies and scripts
├── vercel.json                         # Security headers (CSP, HSTS, etc.)
├── tsconfig.json                       # TypeScript config
├── .env                                # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (not committed)
│
├── supabase/
│   ├── migrations/                     # 25 sequential SQL migrations
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_settings.sql
│   │   ├── ...
│   │   └── 00022_security_hardening_3.sql
│   └── .temp/                          # CLI cache (gitignored)
│
├── src/
│   ├── main.jsx                        # App entry point
│   ├── App.jsx                         # Routes, auth guards, role guards
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── InstitutionalLogin.jsx
│   │   │   └── InstitutionalSignup.jsx
│   │   ├── dashboard/
│   │   │   └── StudentDashboard.jsx
│   │   ├── courses/
│   │   │   └── CourseList.jsx
│   │   ├── assignments/
│   │   │   └── StudentAssignments.jsx
│   │   ├── submissions/
│   │   │   └── UploadPortal.jsx
│   │   ├── history/
│   │   │   └── SubmissionHistory.jsx
│   │   ├── lecturer/
│   │   │   ├── LecturerLayout.jsx
│   │   │   ├── LecturerDashboard.jsx
│   │   │   ├── LecturerSubmissions.jsx
│   │   │   ├── LecturerAssignments.jsx
│   │   │   ├── LecturerStudents.jsx
│   │   │   └── lecturerStyles.js
│   │   ├── admin/
│   │   │   ├── QuestionnaireDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── onboarding/
│   │   │   └── OnboardingWizard.jsx
│   │   ├── post-interview/
│   │   │   └── PostInterviewWizard.jsx
│   │   └── settings/
│   │       └── Settings.jsx
│   │
│   ├── components/
│   │   └── common/
│   │       ├── Layout.jsx             # Sidebar navigation + role-based menu
│   │       ├── ErrorBoundary.jsx
│   │       ├── MarkdownEditor.jsx     # DOMPurify-sanitized markdown
│   │       ├── PostInterviewModal.jsx
│   │       └── UploadProgress.jsx
│   │
│   ├── store/                         # Zustand stores
│   │   ├── authStore.js               # Auth state, login/signup/logout, role management
│   │   ├── courseStore.js
│   │   ├── assignmentStore.js
│   │   ├── submissionStore.js
│   │   ├── rubricStore.js
│   │   ├── uploadStore.js
│   │   ├── toastStore.js
│   │   └── errorLogStore.js
│   │
│   ├── lib/
│   │   ├── supabaseService.js         # Supabase client + data fetching
│   │   ├── activityService.js         # Activity logging
│   │   └── supabase.js                # Supabase client init
│   │
│   ├── utils/
│   │   └── dataMapper.js
│   ├── hooks/
│   ├── middleware/
│   ├── services/
│   ├── validation/
│   ├── styles/
│   ├── context/
│   └── assets/
│
└── dist/                              # Production build output
```

---

## Key Features

### Student
- View enrolled courses and browse available courses
- View assignments with due dates, allowed file types, and size limits
- Submit assignments via file upload or video link
- Track submission history, grades, and feedback
- Complete pre-interview (onboarding) and post-interview questionnaires

### Lecturer
- Create and manage assignments (with rubrics, resubmission policies, late penalties)
- View and grade student submissions per course
- Grade using rubrics with per-criterion scoring
- Export submissions as CSV
- View enrolled students per course

### Admin
- Analytics dashboard with demographic, storage practice, and Likert scale charts
- Cross-tabulation analysis (storage method vs demographics)
- User management with role assignment
- View all submissions, assignments, and courses
- Post-interview response analytics (student + lecturer)
- Export raw, pivoted, and summary data as CSV

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (`https://fjnhnajjbofjeqgoqxmm.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public API key |

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment

```bash
# Deploy to Vercel production
vercel --prod
```

The live site is at https://tatu-submission-portal.vercel.app.

---

## Database Migrations

Migrations are sequential SQL files in `supabase/migrations/`. To apply a migration to the remote database:

```bash
supabase link --project-ref fjnhnajjbofjeqgoqxmm
supabase db query --linked --file supabase/migrations/00022_security_hardening_3.sql
```

> **Note:** The remote database was initially built via the Supabase SQL editor, so `supabase_migrations.schema_migrations` is empty. Use `supabase db query --linked` instead of `supabase db push`.
