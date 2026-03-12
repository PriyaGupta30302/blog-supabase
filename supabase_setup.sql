-- 1. Blog Views Counter
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- RPC function to increment views atomically
CREATE OR REPLACE FUNCTION increment_views(blog_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blogs
  SET views = COALESCE(views, 0) + 1
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Blog Likes System
CREATE TABLE IF NOT EXISTS blog_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(blog_id, user_id)
);

-- 3. Comment System
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Blog Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- 5. Draft and Publish Feature
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published'));
