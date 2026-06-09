
-- Add description and tags to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Footer Ads table
CREATE TABLE IF NOT EXISTS footer_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'banner', -- banner, text, html, button, image, video
  content text,
  image_url text,
  destination_url text,
  open_new_tab boolean DEFAULT true,
  is_active boolean DEFAULT true,
  position int DEFAULT 0,
  click_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE footer_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_footer_ads" ON footer_ads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_footer_ads" ON footer_ads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_footer_ads" ON footer_ads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_footer_ads" ON footer_ads FOR DELETE TO authenticated USING (true);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- view, search, click
  entity_type text, -- post, model, category
  entity_id uuid,
  entity_slug text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_analytics" ON analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_analytics" ON analytics FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Insert default site settings if not present
INSERT INTO settings (key, value) VALUES
  ('site_name', '"LeaksHaven"'),
  ('site_description', '"Premium content directory. Browse exclusive creator collections."'),
  ('primary_color', '"#ff5a3c"'),
  ('secondary_color', '"#ff784e"'),
  ('posts_per_page', '12'),
  ('show_featured', 'true'),
  ('show_trending', 'true'),
  ('show_popular', 'true'),
  ('card_style', '"default"'),
  ('font_family', '"Inter"')
ON CONFLICT (key) DO NOTHING;
