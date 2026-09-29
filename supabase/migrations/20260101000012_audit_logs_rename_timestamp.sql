-- 20260101000012_audit_logs_rename_timestamp.sql
--
-- REASON: The audit_logs table was created with a column named `timestamp`
-- (migration 20260101000000). All subsequent application code and the Admin
-- audit viewer page query and order by `created_at`, which does not exist.
-- Result: audit dates display as "Invalid Date" and sort order is undefined.
--
-- FIX: Rename `timestamp` → `created_at` to match every existing application
-- reference. No FK dependencies point to this column. No cascading effects.
-- Existing data is preserved exactly. The column default remains NOW().

ALTER TABLE audit_logs RENAME COLUMN "timestamp" TO created_at;
