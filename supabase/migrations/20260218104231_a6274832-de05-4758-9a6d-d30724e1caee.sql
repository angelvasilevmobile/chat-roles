
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If no admin exists yet, promote this user to admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    UPDATE public.user_roles SET role = 'admin' WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Run after handle_new_user has already inserted the 'user' role
CREATE TRIGGER on_first_admin_assignment
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_first_admin();
