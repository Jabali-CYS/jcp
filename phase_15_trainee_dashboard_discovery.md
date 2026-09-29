# Phase 15 - Trainee Dashboard Discovery

## 1. Current Dashboard Inventory
- Location: `app/dashboard/page.tsx`
- Current features:
  - Welcome message.
  - Links to Digital Content (`/dashboard/content`) and Certificates (`/dashboard/certificates`).
  - List of user's `applications` (showing status and date).
  - List of user's `enrollments` (showing status, session date, program name, and link to session details).

## 2. Current Profile Inventory
- Location: `app/profile/` does not exist. No profile editing UI is currently implemented.
- The registration flow only captures `fullName`, `email`, and `password`.

## 3. Current Database Model
- `profiles`: `id`, `full_name`, `age`, `party_affiliation`, `experience`.
- `applications`: Links `profile_id` and `program_id`. Status can be pending, approved, rejected.
- `enrollments`: Links `profile_id` and `session_id`. Status can be active, completed, dropped.
- `sessions`: Links to `programs` and `training_packages`, contains `session_date`.
- `attendance`: Links to `enrollment_id` and `session_id`. Contains `status` (present, absent).
- `evaluations`: Links to `enrollment_id`. Contains `type` (pre, post) and `feedback`.
- `certificates`: Links to `enrollment_id`. Contains `type` (completion, participation), `issue_date`, `serial_number`.

## 4. Existing RLS/Security Model
- `profiles`: User can SELECT and UPDATE their own row.
- `applications`: User can SELECT their own.
- `enrollments`: User can SELECT their own.
- `attendance`: User can SELECT their own.
- `evaluations`: **User CANNOT SELECT their own.** RLS only allows `is_admin() OR is_trainer()`.
- `certificates`: User can SELECT their own.

## 5. Source-backed profile fields
- `full_name`: SOURCE_VERIFIED (Registration)
- `party_affiliation`: SOURCE_VERIFIED (links & info.txt specifies Party Membership details)
- `age`: INFERENCE (Useful for youth programs, but minimal)
- `experience`: INFERENCE
No sensitive fields like National ID or exact address are stored, maintaining data minimization.

## 6. User-editable fields
- `full_name` (Potentially, though changes might require admin review in strict institutional contexts. For now, technically editable via RLS).
- `age`
- `experience`

## 7. Admin-controlled fields
- `party_affiliation` (REQUIRES_DECISION: Should the user declare this, or does the admin verify membership status via external party DB?)

## 8. System-controlled fields
- `id`
- `created_at`
- `updated_at`
- Email (Managed by Supabase Auth).

## 9. Dashboard Information Architecture
- **Summary View (`/dashboard`)**: Welcome, quick stats, active enrollments, recent applications.
- **Profile View (`/dashboard/profile`)**: Form to edit `full_name`, `age`, `experience`, and view `party_affiliation`.
- **Applications & Programs**: Integrated into the summary or a dedicated `/dashboard/applications`.
- **Sessions & Attendance**: Link from enrollments to `/dashboard/sessions/[id]`. Attendance status visible here.
- **Evaluations**: **BLOCKED** by RLS.
- **Resources (`/dashboard/content`)**: Existing.
- **Certificates (`/dashboard/certificates`)**: Existing.

## 10. Route reuse vs new routes
- **Reuse**: `/dashboard` (modify), `/dashboard/content`, `/dashboard/certificates`, `/dashboard/sessions/[id]`.
- **New**: `/dashboard/profile` (for editing personal data).

## 11. Data loading strategy
- Use Next.js Server Components.
- Perform grouped queries where logical (e.g., fetch enrollments with nested sessions and attendance).
- Keep profile fetching lightweight and centralized.

## 12. Empty states
- **New trainee**: Show prompt to browse programs.
- **No active sessions**: Clear message explaining wait times.

## 13. Security threats
- BOLA/IDOR on profile update: Must ensure the server action uses `auth.uid()` and not a client-provided `profile_id`.

## 14. IDOR/BOLA analysis
- Current RLS prevents cross-user reads for applications, enrollments, attendance, and certificates. Profile updates are restricted to `auth.uid() = id`.

## 15. Mass-assignment analysis
- If a profile update action takes `FormData`, we must explicitly extract only allowed fields (e.g., `full_name`, `age`, `experience`) and ignore others like `id`, `party_affiliation` (if admin-controlled).

## 16. Accessibility requirements
- ARIA labels on profile forms.
- High contrast for validation errors.
- RTL Native.

## 17. Responsive requirements
- Profile form must stack gracefully on mobile (375px).

## 18. Performance considerations
- Fetch profile data only on `/dashboard/profile` or layout if needed for welcome message.

## 19. Migration decision
**BLOCKED / REQUIREMENT DECISION**
- **Evaluations**: The product requirement states "Evaluations/results where appropriate". Current RLS strictly denies Trainees from reading the `evaluations` table. We need a product decision: Should trainees see their evaluations? If yes, a minimal migration is required to update the `evaluations_select` policy.
- **Party Affiliation**: Who controls this? If the admin controls it, we need to ensure the profile update server action explicitly ignores it.

## 20. Implementation plan
1. Await decision on Evaluations RLS and Party Affiliation control.
2. Build `/dashboard/profile` UI and Server Action for safe updating.
3. Refine `/dashboard` summary page to include attendance status inline with enrollments.

## 21. Deferred items
- Full evaluation results display (pending decision).

## 22. Open decisions
- **EVALUATIONS**: Do trainees see their own evaluations?
- **PARTY AFFILIATION**: Is this user-declared or admin-verified?
