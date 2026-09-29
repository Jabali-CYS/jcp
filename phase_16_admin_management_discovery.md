# PHASE 16 — ADMIN MANAGEMENT DISCOVERY

## 1. CURRENT IMPLEMENTATION INVENTORY

**Existing Admin Scope:**
* `/admin` – Processes pending `applications` (approve/reject). Creates `enrollments` via Server Action.
* `/admin/certificates` – Admin issues certificates manually.
* **RLS Base:** The `user_roles` table provides a robust `'admin'` role definition. `is_admin()` helper enforces row-level policies across the entire schema.
* **Database Objects:** Profiles, roles, applications, enrollments, programs, training packages, sessions, attendance, evaluations, digital content, certificates, and audit logs exist in schema.

## 2. ROLE MODEL & PERMISSIONS MATRIX

**Role Representation:**
* Table: `user_roles (user_id, role, created_at)`.
* Constraints: `role IN ('trainee', 'trainer', 'admin')`.
* Function: `is_admin()` uses `auth.uid()` securely.

**Permissions Audit:**
* **Who can create an Admin?** Anyone with the `'admin'` role, or the Next.js `service_role`.
* **Can a trainee/trainer promote themselves?** No. They cannot INSERT/UPDATE `user_roles` because `user_roles_admin_all` enforces `is_admin()`.
* **Can an Admin promote another user?** Yes, via the database (direct API or UI if implemented).
* **Can an Admin demote themselves/another Admin?** Yes, RLS permits DELETE/UPDATE for Admins.
* **Accidental lockout protection:** None currently enforced at the database level.
* **Audit trail:** `audit_logs` table exists, but no triggers currently log role changes.
* **Email-based promotion:** NOT implemented yet.

## 3. USER MANAGEMENT AUDIT

* **Profiles:** Admin can READ/UPDATE.
* **Roles:** Admin can READ/CREATE/UPDATE/DELETE.
* **Applications:** Admin can READ/UPDATE/DELETE.
* **Enrollments:** Admin can READ/CREATE/UPDATE/DELETE.
* **Attendance:** Admin can READ/CREATE/UPDATE/DELETE.
* **Evaluations:** Admin can READ/UPDATE/DELETE.
* **Certificates:** Admin can READ/CREATE/UPDATE/DELETE.

## 4. APPLICATION WORKFLOW

* **Pending:** Trainee requests to join.
* **Approved:** Admin transitions status to 'approved', which creates an `enrollment` via the Server Action (`app/admin/actions.ts`).
* **Rejected:** Admin transitions status to 'rejected'.
* **Duplicate Prevention:** Unique constraint on `(profile_id, program_id)` in `applications` and `(profile_id, session_id)` in `enrollments`.

## 5. ENROLLMENT WORKFLOW

* **Creation:** Generated securely via Admin server action upon application approval.
* **Association:** Ties `profile_id` to `session_id`.
* **IDOR/BOLA:** Prevented. Trainees can only READ their own; Trainers can only READ enrollments within their sessions; Admins have full access.

## 6. PROGRAM / PACKAGE / SESSION MANAGEMENT

* **Current Status:** Not implemented in UI. All data for Programs, Packages, and Sessions is currently database-backed and inserted via seed scripts or manual DB operations.
* **Admin Role:** `is_admin()` allows full CRUD on these entities.
* **Intended Future:** Admin needs UI to manage (create/update/list) Programs, Training Packages, and Sessions.

## 7. CONTENT MANAGEMENT

* **Table:** `digital_content (id, program_id, title, file_url)`.
* **CRUD:** Admin can CREATE/UPDATE/DELETE. Enrolled trainees can READ.
* **File Storage:** `file_url` is just a text field. Storage buckets are NOT currently implemented or provisioned via Supabase Storage.

## 8. CERTIFICATE ADMINISTRATION

* **Issuance:** Fully manual by Admin (`/admin/certificates`).
* **Types:** 'completion' or 'participation'.
* **Generation:** Server-side PDF generation via Next.js routes. Serial numbers are generated securely.
* **Verification:** Public verification (QR) is NOT implemented yet (deferred).

## 9. AUDIT LOGGING

* **Table:** `audit_logs` exists.
* **RLS:** Admin can SELECT. No one has explicit INSERT policy unless via `service_role` or a DB trigger (which bypasses RLS).
* **Current Usage:** NO triggers or application logic currently insert records into `audit_logs`. The table is effectively empty/unused.

## 10. "MAKE ADMIN" REQUIREMENT

* **Requirement:** Admin enters an email -> user becomes Admin.
* **Analysis:**
    * Target must exist in `auth.users` and `profiles`.
    * Cannot simply insert by email directly into `user_roles`. Must lookup UUID from `profiles`/`auth.users`. (Note: `auth.users` is in the `auth` schema, so looking up by email requires `service_role` or a security definer function).
    * Needs confirmation and lockout protection.
* **Status:** REQUIRES_DECISION on whether to implement a Security Definer function to lookup email, or handle lookup purely via Server Action using the `service_role` client.

## 11. SECURITY THREAT MODEL

* **Privilege Escalation:** Blocked by RLS. Trainees/Trainers cannot mutate `user_roles`.
* **Self-Promotion:** Blocked.
* **Admin-to-Admin Escalation:** Admins have equal rights.
* **Role Deletion (Lockout):** Vulnerable. An admin could delete their own or all admin roles, locking the system.
* **Mass Assignment:** Mitigated by strict Server Actions (as seen in Phase 15).
* **Direct REST/PostgREST Bypass:** Blocked by RLS policies.

## 12. ADMIN DASHBOARD INFORMATION ARCHITECTURE (PROPOSED)

* `/admin` -> Overview / Pending Applications (Existing)
* `/admin/users` -> Trainee & Role Management ("Make Admin")
* `/admin/programs` -> Programs & Packages
* `/admin/sessions` -> Sessions & Trainers
* `/admin/content` -> Digital Content (URL-based)
* `/admin/certificates` -> (Existing)

## 13. ROUTES / DUPLICATION

* DO NOT duplicate `/admin`. It will remain the entry point.
* DO NOT duplicate certificate generation.
* New routes required: `/admin/users`, `/admin/programs`, `/admin/sessions`, `/admin/content`.

## 14. DATABASE MIGRATION DECISION

**MINIMAL MIGRATION REQUIRED:**
A migration is required to safely implement "Make Admin" and prevent admin lockout. We need:
1. A trigger or constraint on `user_roles` to prevent deleting the LAST admin (anti-lockout).
2. A `get_user_id_by_email(email)` RPC (or similar) if we want the DB to resolve emails, though doing this entirely in a Server Action via `supabase.auth.admin.listUsers()` is safer and avoids custom Auth schema exposure. Let's decide to use Server Action for email lookup.
3. Therefore, the migration only needs the anti-lockout trigger and potentially basic `audit_logs` triggers for critical operations (like role changes).

## 15. DEFERRED ITEMS

* Public verification / QR codes for certificates.
* Supabase Storage integration (content remains URL-based).
* Gamification/Electoral Campaigning (explicitly out of scope).

## 16. OPEN DECISIONS

* **Decision 1:** Should Audit Logging be triggered via PostgreSQL `AFTER INSERT/UPDATE/DELETE` triggers or via Server Actions?
  * *Recommendation:* PostgreSQL triggers are more robust and capture direct API mutations.
* **Decision 2:** Should "Make Admin" email resolution use `supabase.auth.admin.listUsers()` inside a Server Action?
  * *Recommendation:* Yes. This avoids exposing the `auth.users` table to the `public` schema via a Security Definer function.

## 17. IMPLEMENTATION PLAN

1. **Migration:** Create `20260101000011_admin_lockout_protection.sql` to prevent deleting the final admin and add an audit trigger for `user_roles` changes.
2. **Users UI:** Build `/admin/users` to list trainees and provide the "Make Admin" server action.
3. **Programs/Sessions UI:** Build simple CRUD pages for institutional resources.
4. **Content UI:** Build simple CRUD for `digital_content`.
5. **Security/QA:** Perform strict BOLA tests ensuring Trainers/Trainees cannot access these new admin routes.
