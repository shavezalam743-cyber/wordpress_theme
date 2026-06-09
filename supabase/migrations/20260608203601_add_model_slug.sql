
ALTER TABLE models ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE models SET slug = LOWER(
  REGEXP_REPLACE(COALESCE(stage_name, name), '[^a-zA-Z0-9]+', '-', 'g')
) WHERE slug IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'models_slug_unique'
  ) THEN
    ALTER TABLE models ADD CONSTRAINT models_slug_unique UNIQUE (slug);
  END IF;
END $$;
