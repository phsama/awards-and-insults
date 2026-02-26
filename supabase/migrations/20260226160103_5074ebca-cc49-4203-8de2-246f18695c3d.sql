
-- Fix permissive update policy on invites - restrict to only marking as used
DROP POLICY "Anon can update used status" ON public.invites;
CREATE POLICY "Signup can mark invite used" ON public.invites
  FOR UPDATE USING (used = false) WITH CHECK (used = true);
