# Database Schema — TaTU Submission Portal

## Entity Relationship

```mermaid
erDiagram
    auth_users ||--|| profiles : "1:1 (extends)"
    profiles ||--o{ courses : "lecturer owns"
    profiles ||--o{ submissions : "student submits"
    profiles ||--o{ accepted_courses : "student enrolls"
    profiles ||--o{ notifications : "receives"
    profiles ||--o{ activity_log : "actions tracked"
    profiles ||--o{ user_sessions : "login sessions"
    profiles ||--o{ research_responses : "onboarding answers"
    profiles ||--o{ post_interview_responses : "feedback answers"

    courses ||--o{ assignments : "has many"
    courses ||--o{ accepted_courses : "enrolled by"

    assignments ||--|| rubrics : "1:1 grading criteria"
    assignments ||--o{ submissions : "has many"

    submissions ||--o{ storage_files : "files in bucket"

    auth_users {
        uuid id PK
    }

    profiles {
        uuid id PK "FK auth.users"
        text name
        text email
        text role "student|lecturer|admin"
        text institution
        text student_id
        boolean onboarding_completed
        boolean post_interview_completed
    }

    courses {
        bigserial id PK
        text code UK "e.g. GCD101"
        text name
        text instructor
        uuid user_id FK "owning lecturer"
        jsonb attachments
    }

    assignments {
        text id PK "assign-{uuid}"
        text course_code FK "FK courses.code"
        text title
        text description
        timestamptz due_date
        jsonb submission_types
        integer max_size
        text[] allowed_extensions
        integer late_penalty
        boolean allow_resubmission
        uuid user_id FK "owning lecturer"
    }

    rubrics {
        text id PK "rubric-{uuid}"
        text assignment_id FK "1:1 with assignment"
        jsonb criteria
    }

    submissions {
        text id PK "TaTU-{hash}"
        text assignment_id FK
        text course_code
        uuid user_id FK "submitting student"
        jsonb files "storage references"
        text status "Pending|Late|Graded"
        integer score
        text feedback
        jsonb rubric_scores
        jsonb versions "resubmission history"
    }

    accepted_courses {
        uuid user_id PK "FK auth.users"
        bigserial course_id PK "FK courses"
        timestamptz accepted_at
    }

    notifications {
        bigserial id PK
        uuid user_id FK
        text type "deadline|graded|overdue|info"
        text title
        text message
        boolean read
    }

    activity_log {
        bigserial id PK
        uuid user_id FK
        text action
        text entity_type
        text entity_id
        jsonb metadata
    }

    user_sessions {
        bigserial id PK
        uuid user_id FK
        timestamptz login_at
        timestamptz logout_at
        integer duration_seconds
    }

    research_responses {
        uuid id PK
        uuid user_id FK
        text section
        text question_key
        text answer
    }

    post_interview_responses {
        uuid id PK
        uuid user_id FK
        text role
        text section
        text question_key
        text answer
    }
```

## Tables Overview

| Table | Purpose | Key Relationships |
|---|---|---|
| `profiles` | User identity (extends auth.users) | 1:1 with auth.users; role determines access |
| `courses` | Course catalog | Owned by lecturer (`user_id`); identified by `code` |
| `assignments` | Assignment definitions | Belongs to course (`course_code`); owned by lecturer |
| `rubrics` | Grading criteria | 1:1 with assignment |
| `submissions` | Student submissions | Belongs to assignment + student; tracks versions |
| `accepted_courses` | Student-course enrollment | M:N join; blocks submission if not enrolled |
| `notifications` | User alerts | Deadline, grade, overdue, info types |
| `activity_log` | Action audit trail | All user actions for research/analytics |
| `user_sessions` | Login session tracking | Login/logout times, duration |
| `research_responses` | Pre-study questionnaire | Onboarding survey answers |
| `post_interview_responses` | Post-usage feedback | Post-interview survey answers |

## RLS Policy Summary

| Table | Student | Lecturer | Admin |
|---|---|---|---|
| `profiles` | Read/update own | Read/update own | Read/update/delete all |
| `courses` | Read all | CRUD own (`user_id`) | CRUD all |
| `assignments` | Read all | CRUD own (via course ownership) | CRUD all |
| `rubrics` | Read all | CRUD own | CRUD all |
| `submissions` | Insert (enrolled only), read own | Read/grade/delete own course submissions | Read/grade/delete all |
| `accepted_courses` | Manage own (`auth.uid() = user_id`) | — | — |
| `notifications` | Read/update own | Read/update own | Read/update own |
| `activity_log` | Insert own | Insert own | Read all, insert own |
| `user_sessions` | Read/insert/update own | Read/insert/update own | Read all, insert own |
| `research_responses` | Insert/read own | Insert/read own | Read all |
| `post_interview_responses` | Insert/read own | Insert/read own | Read all |

### Key RLS Mechanisms

- **`get_my_role()`** — SECURITY DEFINER function that reads the user's role from `profiles`. Used in policies to grant admin bypass without recursion.
- **`profile_role_guard`** — Trigger on `profiles` that prevents non-admin users from setting or changing the `role` column. Blocks privilege escalation.
- **Enrollment check** — `submissions` INSERT policy verifies the student has an `accepted_courses` row for the assignment's course. Blocks unauthorized submissions.
- **Anon revocation** — All write privileges (INSERT, UPDATE, DELETE, TRUNCATE) revoked from the `anon` role on every table. Unauthenticated requests fail immediately.

## Storage Buckets

| Bucket | Access | Limit | MIME Types | Path Structure |
|---|---|---|---|---|
| `submission-files` | Private | 50 MB | PDF, Word, PPT, Excel, text, CSV, ZIP, images, video | `{assignment_id}/{user_id}/filename` |
| `assignment-files` | Public | 50 MB | PDF, Word, PPT, Excel, text, CSV, ZIP, images | `{user_id}/filename` |
| `course-images` | Public | 5 MB | JPEG, PNG, GIF, WebP | `{user_id}/filename` |

### Storage RLS

- **submission-files**: Students upload/read own; lecturers read their course submissions; admins read all
- **assignment-files**: Lecturers/admins upload/delete own; anyone can read (public bucket)
- **course-images**: Lecturers/admins upload/update/delete; anyone can read (public bucket)

## Key Data Flows

### Submission Validation Chain

```
Student clicks "Submit"
  → submissions INSERT policy checks:
    1. auth.uid() = user_id (must be submitting as yourself)
    2. assignment exists
    3. assignment's course exists
    4. student has accepted_courses row for that course
  → If all pass: file uploaded to submission-files bucket
  → submission record created in submissions table
```

### Role Escalation Prevention

```
Non-admin tries to UPDATE profiles SET role = 'admin'
  → profile_role_guard trigger fires
  → Checks get_my_role() of the requesting user
  → If not admin: RAISE EXCEPTION 'Only administrators can assign roles'
  → Query blocked
```
