
CREATE TABLE public.beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_number integer NOT NULL UNIQUE,
  label text DEFAULT '',
  is_occupied boolean NOT NULL DEFAULT false,
  patient_name text DEFAULT '',
  notes text DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view
CREATE POLICY "Authenticated can view beds" ON public.beds
  FOR SELECT TO authenticated USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert beds" ON public.beds
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update beds" ON public.beds
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete beds" ON public.beds
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed 10 default beds
INSERT INTO public.beds (bed_number, label) VALUES
  (1, 'Room A - Bed 1'), (2, 'Room A - Bed 2'),
  (3, 'Room B - Bed 1'), (4, 'Room B - Bed 2'),
  (5, 'Room C - Bed 1'), (6, 'Room C - Bed 2'),
  (7, 'Room D - Bed 1'), (8, 'Room D - Bed 2'),
  (9, 'Room E - Bed 1'), (10, 'Room E - Bed 2');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.beds;
