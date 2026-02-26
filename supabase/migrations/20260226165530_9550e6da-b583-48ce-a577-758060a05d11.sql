
-- Badges available (defined by leader)
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🏅',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view badges"
  ON public.badges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lider can manage badges"
  ON public.badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'lider'));

-- User-badge assignments
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view user badges"
  ON public.user_badges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Lider can manage user badges"
  ON public.user_badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'lider'));

-- Seed 10 fun badges
INSERT INTO public.badges (name, emoji, description) VALUES
  ('Lenda Viva', '👑', 'O cara é uma lenda, não tem outra explicação'),
  ('Caloteiro Mor', '💸', 'Deve pra todo mundo e não paga ninguém'),
  ('Rei do Atraso', '⏰', 'Se a festa começa às 20h, ele chega às 23h'),
  ('Paneleiro Oficial', '🍳', 'O chef do grupo, mestre da cozinha'),
  ('Bêbado Padrão', '🍺', 'Primeiro a cair, último a lembrar'),
  ('Paz e Amor', '✌️', 'Nunca briga, sempre concilia'),
  ('Fofoqueiro Master', '🗣️', 'Sabe de tudo antes de todo mundo'),
  ('Sumido Profissional', '👻', 'Some por semanas e volta como se nada tivesse acontecido'),
  ('Motorista da Galera', '🚗', 'Sempre dá carona, herói sem capa'),
  ('Zoeiro Nato', '🤡', 'Não leva nada a sério, mas faz todo mundo rir');
