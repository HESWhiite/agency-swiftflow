
-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create shipments table
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  sender_id UUID REFERENCES auth.users(id),
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  sender_phone TEXT,
  sender_address TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  receiver_email TEXT,
  receiver_phone TEXT,
  receiver_address TEXT NOT NULL,
  package_description TEXT,
  weight NUMERIC,
  dimensions TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled')),
  estimated_delivery DATE,
  actual_delivery DATE,
  shipping_cost NUMERIC DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipment tracking events
CREATE TABLE public.tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  shipment_id UUID REFERENCES public.shipments(id),
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

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

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Shipments policies
CREATE POLICY "Users can view own shipments" ON public.shipments FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "Admins can manage all shipments" ON public.shipments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view shipment by tracking" ON public.shipments FOR SELECT USING (true);

-- Tracking events policies
CREATE POLICY "Anyone can view tracking events" ON public.tracking_events FOR SELECT USING (true);
CREATE POLICY "Admins can manage tracking events" ON public.tracking_events FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all invoices" ON public.invoices FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate tracking number function
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'SWF-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Generate invoice number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  result TEXT;
BEGIN
  result := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
  RETURN result;
END;
$$;
