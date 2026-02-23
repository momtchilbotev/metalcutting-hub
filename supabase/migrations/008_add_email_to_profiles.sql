-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR;

-- Sync existing emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Create function to sync email on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for syncing email on user update (e.g., email change)
DROP TRIGGER IF EXISTS on_auth_user_email_change ON auth.users;
CREATE TRIGGER on_auth_user_email_change
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_email();
