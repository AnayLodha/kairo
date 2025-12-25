-- Create a table for custom subjects per user
CREATE TABLE public.user_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own subjects" 
ON public.user_subjects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subjects" 
ON public.user_subjects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" 
ON public.user_subjects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Insert default subjects for new users (handled via trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user_subjects()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_subjects (user_id, name) VALUES
    (new.id, 'English'),
    (new.id, 'Mathematics'),
    (new.id, 'Physics'),
    (new.id, 'Chemistry'),
    (new.id, 'Computer Science'),
    (new.id, 'Entrepreneurship');
  RETURN new;
END;
$function$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created_subjects
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subjects();