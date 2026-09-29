CREATE POLICY "content_trainer_select"
ON digital_content
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM sessions s
        WHERE s.program_id = digital_content.program_id
          AND s.trainer_id = auth.uid()
    )
);
