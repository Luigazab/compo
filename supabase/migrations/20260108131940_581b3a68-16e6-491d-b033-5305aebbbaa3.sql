-- Create school_settings table for storing daycare/school information
CREATE TABLE public.school_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  phone text,
  email text,
  website text,
  description text,
  logo_url text,
  timezone text DEFAULT 'America/New_York',
  date_format text DEFAULT 'MM/DD/YYYY',
  language text DEFAULT 'en',
  open_time time DEFAULT '07:00:00',
  close_time time DEFAULT '18:00:00',
  work_days text[] DEFAULT ARRAY['mon', 'tue', 'wed', 'thu', 'fri'],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create holidays table for school holidays
CREATE TABLE public.holidays (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create notification_settings table for configuring notifications
CREATE TABLE public.notification_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for school_settings (everyone can read, only admins can modify)
CREATE POLICY "Everyone can view school settings"
  ON public.school_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage school settings"
  ON public.school_settings FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for holidays
CREATE POLICY "Everyone can view holidays"
  ON public.holidays FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage holidays"
  ON public.holidays FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for notification_settings
CREATE POLICY "Everyone can view notification settings"
  ON public.notification_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage notification settings"
  ON public.notification_settings FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Add trigger for updated_at on school_settings
CREATE TRIGGER update_school_settings_updated_at
  BEFORE UPDATE ON public.school_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default notification settings
INSERT INTO public.notification_settings (setting_key, setting_value) VALUES
  ('email_daily_summary', true),
  ('email_wellbeing_alerts', true),
  ('email_announcements', true),
  ('email_document_reminders', true),
  ('push_new_messages', true),
  ('push_photo_uploads', false);