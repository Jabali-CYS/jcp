-- 20260101000007_certificates_serial_number.sql

-- Add serial_number column allowing null initially
ALTER TABLE certificates ADD COLUMN serial_number TEXT;

-- Enforce uniqueness and NOT NULL
ALTER TABLE certificates ADD CONSTRAINT certificates_serial_number_key UNIQUE (serial_number);

-- Trigger to auto-generate serial number on insert if not provided
CREATE OR REPLACE FUNCTION generate_certificate_serial()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.serial_number IS NULL THEN
    NEW.serial_number := 'JCP-ACAD-' || TO_CHAR(NEW.issue_date, 'YYYY') || '-' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_certificate_serial
BEFORE INSERT ON certificates
FOR EACH ROW
EXECUTE FUNCTION generate_certificate_serial();

-- Make serial_number NOT NULL since it will be generated for all new inserts, and existing rows is 0
ALTER TABLE certificates ALTER COLUMN serial_number SET NOT NULL;
