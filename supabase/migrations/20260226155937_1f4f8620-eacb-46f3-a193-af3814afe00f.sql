
-- Timestamp updater function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Roles enum
CREATE TYPE public.app_role AS ENUM ('lider', 'porta_voz', 'vagabundo');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'vagabundo',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Lider can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'lider'));

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE,
  aka TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'vagabundo');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  used BOOLEAN NOT NULL DEFAULT false,
  used_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Anyone can check invite codes (for signup), lider can manage
CREATE POLICY "Anyone can check invite codes" ON public.invites
  FOR SELECT USING (true);
CREATE POLICY "Lider can manage invites" ON public.invites
  FOR ALL USING (public.has_role(auth.uid(), 'lider'));
CREATE POLICY "Anon can update used status" ON public.invites
  FOR UPDATE USING (true) WITH CHECK (true);

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_poll BOOLEAN DEFAULT false,
  poll_question TEXT,
  poll_options JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view posts" ON public.posts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create posts" ON public.posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reactions
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL DEFAULT '❤️',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view reactions" ON public.reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own reactions" ON public.reactions FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  event_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Poll votes
CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  option_index INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view votes" ON public.poll_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote" ON public.poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Event RSVPs
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view rsvps" ON public.event_rsvps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own rsvps" ON public.event_rsvps FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Library items
CREATE TABLE public.library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('link', 'file')),
  url TEXT,
  file_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view library" ON public.library_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add to library" ON public.library_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON public.library_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Group savings
CREATE TABLE public.group_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  goal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.group_savings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view savings" ON public.group_savings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lider can manage savings" ON public.group_savings FOR ALL USING (public.has_role(auth.uid(), 'lider'));

-- Contributions
CREATE TABLE public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  savings_id UUID REFERENCES public.group_savings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view contributions" ON public.contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add contributions" ON public.contributions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Personal goals
CREATE TABLE public.personal_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  goal NUMERIC NOT NULL,
  current NUMERIC NOT NULL DEFAULT 0,
  emoji TEXT DEFAULT '🎯',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.personal_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals" ON public.personal_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON public.personal_goals FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Awards: Seasons
CREATE TABLE public.award_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL UNIQUE,
  phase TEXT NOT NULL DEFAULT 'setup' CHECK (phase IN ('setup', 'nominations', 'voting', 'results')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.award_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view seasons" ON public.award_seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lider can manage seasons" ON public.award_seasons FOR ALL USING (public.has_role(auth.uid(), 'lider'));

-- Awards: Categories
CREATE TABLE public.award_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES public.award_seasons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🏆',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.award_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view categories" ON public.award_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lider can manage categories" ON public.award_categories FOR ALL USING (public.has_role(auth.uid(), 'lider'));

-- Awards: Nominations
CREATE TABLE public.award_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.award_categories(id) ON DELETE CASCADE NOT NULL,
  nominated_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nominated_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, nominated_user_id, nominated_by)
);
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view nominations" ON public.award_nominations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can nominate" ON public.award_nominations FOR INSERT TO authenticated WITH CHECK (auth.uid() = nominated_by);

-- Awards: Votes
CREATE TABLE public.award_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.award_categories(id) ON DELETE CASCADE NOT NULL,
  voted_for UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, voted_by)
);
ALTER TABLE public.award_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view votes" ON public.award_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote" ON public.award_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = voted_by);

-- Insert initial invite codes
INSERT INTO public.invites (code) VALUES 
  ('MF-2024-ALPHA'),
  ('MF-2024-BETA'),
  ('MF-2024-GAMMA'),
  ('MF-2024-DELTA'),
  ('MF-2024-OMEGA'),
  ('MF-2024-SIGMA');

-- Insert initial group savings
INSERT INTO public.group_savings (name, goal) VALUES ('Caixinha do Grupo', 5000);

-- Insert initial award season
INSERT INTO public.award_seasons (year, phase) VALUES (2024, 'voting');
