-- Create reports table for listing reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_reports_listing_id ON public.reports(listing_id);
CREATE INDEX idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see their own reports
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- RLS: Anyone authenticated can insert reports
CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS: Admins and moderators can view all reports
CREATE POLICY "Admins can manage reports" ON public.reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Prevent duplicate reports from same user for same listing
CREATE UNIQUE INDEX idx_reports_unique ON public.reports(listing_id, reporter_id);
