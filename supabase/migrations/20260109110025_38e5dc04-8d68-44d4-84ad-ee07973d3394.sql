-- Create teacher_classrooms junction table for multi-classroom support
CREATE TABLE public.teacher_classrooms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(teacher_id, classroom_id)
);

-- Enable RLS
ALTER TABLE public.teacher_classrooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage teacher_classrooms"
    ON public.teacher_classrooms FOR ALL
    USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Teachers can view their own assignments"
    ON public.teacher_classrooms FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "Everyone can view teacher assignments"
    ON public.teacher_classrooms FOR SELECT
    USING (true);

-- Update is_teacher_of_child function to check both old teacher_id and new junction table
CREATE OR REPLACE FUNCTION public.is_teacher_of_child(user_id uuid, child_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM children c
        JOIN classrooms cl ON c.classroom_id = cl.id
        LEFT JOIN teacher_classrooms tc ON cl.id = tc.classroom_id
        WHERE c.id = $2 AND (cl.teacher_id = $1 OR tc.teacher_id = $1)
    );
END;
$function$;

-- Add index for performance
CREATE INDEX idx_teacher_classrooms_teacher_id ON public.teacher_classrooms(teacher_id);
CREATE INDEX idx_teacher_classrooms_classroom_id ON public.teacher_classrooms(classroom_id);

-- Migrate existing classroom teacher assignments to the junction table
INSERT INTO public.teacher_classrooms (teacher_id, classroom_id, is_primary)
SELECT teacher_id, id, true
FROM public.classrooms
WHERE teacher_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Create wellbeing_media table for wellbeing report photos
CREATE TABLE public.wellbeing_media (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    wellbeing_report_id UUID NOT NULL REFERENCES public.wellbeing_reports(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on wellbeing_media
ALTER TABLE public.wellbeing_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wellbeing_media
CREATE POLICY "Parents can view their children's wellbeing media"
    ON public.wellbeing_media FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM wellbeing_reports wr
        WHERE wr.id = wellbeing_media.wellbeing_report_id
        AND is_parent_of_child(auth.uid(), wr.child_id)
    ));

CREATE POLICY "Teachers can create wellbeing media for their reports"
    ON public.wellbeing_media FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM wellbeing_reports wr
        WHERE wr.id = wellbeing_media.wellbeing_report_id
        AND wr.created_by = auth.uid()
    ));

CREATE POLICY "Teachers can view classroom wellbeing media"
    ON public.wellbeing_media FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM wellbeing_reports wr
        WHERE wr.id = wellbeing_media.wellbeing_report_id
        AND is_teacher_of_child(auth.uid(), wr.child_id)
    ));

CREATE POLICY "Teachers can delete own wellbeing media"
    ON public.wellbeing_media FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM wellbeing_reports wr
        WHERE wr.id = wellbeing_media.wellbeing_report_id
        AND wr.created_by = auth.uid()
    ));