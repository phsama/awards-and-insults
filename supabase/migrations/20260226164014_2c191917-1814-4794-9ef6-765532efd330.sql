
CREATE TABLE public.event_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false,
  checked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_checklist_items ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view
CREATE POLICY "Authenticated can view checklist"
  ON public.event_checklist_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Lider can insert/delete checklist items
CREATE POLICY "Lider can manage checklist"
  ON public.event_checklist_items
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'lider'));

-- Any authenticated user can check/uncheck items
CREATE POLICY "Users can check items"
  ON public.event_checklist_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
