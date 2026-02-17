
-- Add room column to messages (null = general)
ALTER TABLE public.messages ADD COLUMN room text NOT NULL DEFAULT 'general';

-- Create music_tracks table (admin posts YouTube/SoundCloud links)
CREATE TABLE public.music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view music" ON public.music_tracks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert music" ON public.music_tracks
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete music" ON public.music_tracks
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create stories table (admin publishes)
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view stories" ON public.stories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert stories" ON public.stories
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete stories" ON public.stories
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create drawings table (all users can draw)
CREATE TABLE public.drawings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view drawings" ON public.drawings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own drawings" ON public.drawings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own drawings" ON public.drawings
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can delete any drawing" ON public.drawings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for drawings
INSERT INTO storage.buckets (id, name, public) VALUES ('drawings', 'drawings', true);

CREATE POLICY "Anyone can view drawings" ON storage.objects
  FOR SELECT USING (bucket_id = 'drawings');

CREATE POLICY "Authenticated can upload drawings" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'drawings');

CREATE POLICY "Users can delete own drawings" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'drawings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.music_tracks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drawings;
