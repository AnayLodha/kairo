-- Enable RLS on all tables (idempotent)
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;

-- Policies for user_subjects
DROP POLICY IF EXISTS "Users can view own subjects" ON public.user_subjects;
CREATE POLICY "Users can view own subjects" ON public.user_subjects
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subjects" ON public.user_subjects;
CREATE POLICY "Users can insert own subjects" ON public.user_subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subjects" ON public.user_subjects;
CREATE POLICY "Users can update own subjects" ON public.user_subjects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subjects" ON public.user_subjects;
CREATE POLICY "Users can delete own subjects" ON public.user_subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Verify/Fix other tables just in case (optional, but good practice)
ALTER TABLE public.academic_marks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own marks" ON public.academic_marks;
CREATE POLICY "Users can view own marks" ON public.academic_marks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own marks" ON public.academic_marks;
CREATE POLICY "Users can insert own marks" ON public.academic_marks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own marks" ON public.academic_marks;
CREATE POLICY "Users can update own marks" ON public.academic_marks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own marks" ON public.academic_marks;
CREATE POLICY "Users can delete own marks" ON public.academic_marks
  FOR DELETE USING (auth.uid() = user_id);
