
-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_tags" ON tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_tags" ON tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_tags" ON tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_tags" ON tags FOR DELETE TO authenticated USING (true);

-- Models
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stage_name text,
  bio text,
  cover_image text,
  profile_image text,
  country text,
  nationality text,
  age int,
  height text,
  weight text,
  figure_size text,
  hair_color text,
  eye_color text,
  website text,
  social_links jsonb DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_trending boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_models" ON models FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_models" ON models FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_models" ON models FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_models" ON models FOR DELETE TO authenticated USING (true);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  cover_image text,
  preview_video text,
  file_size text,
  image_count int DEFAULT 0,
  video_count int DEFAULT 0,
  view_count int DEFAULT 0,
  is_trending boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_upcoming boolean DEFAULT false,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  open_link text,
  created_at timestamptz DEFAULT now(),
  published_at timestamptz DEFAULT now()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_posts" ON posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_posts" ON posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_posts" ON posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_posts" ON posts FOR DELETE TO authenticated USING (true);

-- Post <-> Models
CREATE TABLE IF NOT EXISTS post_models (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, model_id)
);
ALTER TABLE post_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_post_models" ON post_models FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_post_models" ON post_models FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_post_models" ON post_models FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_post_models" ON post_models FOR DELETE TO authenticated USING (true);

-- Post <-> Tags
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_post_tags" ON post_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_post_tags" ON post_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_post_tags" ON post_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_post_tags" ON post_tags FOR DELETE TO authenticated USING (true);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_settings" ON settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_settings" ON settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_settings" ON settings FOR DELETE TO authenticated USING (true);
