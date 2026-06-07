-- Create the articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content_md text NOT NULL,
  img text,
  tags text[],
  is_highlight boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public articles are viewable by everyone." 
  ON articles FOR SELECT 
  USING (true);

-- Allow authenticated users to insert/update/delete (Admin access)
CREATE POLICY "Authenticated users can insert articles" 
  ON articles FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles" 
  ON articles FOR UPDATE
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete articles" 
  ON articles FOR DELETE
  TO authenticated 
  USING (true);

-- Insert some dummy data
INSERT INTO articles (title, description, content_md, img, tags, is_highlight)
VALUES 
(
  'My test thoughts', 
  'A brief summary of my most recent article, exploring topics on leadership, storytelling, and community.', 
  '# My test thoughts
  
Here is a paragraph about leadership and community. It is formatted in **Markdown**.

## Section 2
- Point 1
- Point 2

> This is a blockquote about storytelling.', 
  '', 
  ARRAY['Leadership', 'Community'], 
  true
),
(
  'Theological Explorations', 
  'A recap of my recent notes on the intersection of faith and modern youth development.', 
  '# Theological Explorations
  
Exploring the intersection of faith and modern youth development...', 
  '', 
  ARRAY['Theology', 'Youth'], 
  false
),
(
  'Journalism highlights', 
  'A deep dive into some storytelling exercises and local event administration.', 
  '# Journalism Highlights
  
Storytelling exercises can take many forms...', 
  '', 
  ARRAY['Journalism'], 
  false
);
