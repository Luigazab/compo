-- Fix function search_path for security
CREATE OR REPLACE FUNCTION public.is_teacher_of_child(user_id uuid, child_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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

CREATE OR REPLACE FUNCTION public.is_parent_of_child(user_id uuid, child_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM child_parent
        WHERE parent_id = $1 AND child_id = $2
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    RETURN (SELECT role FROM users WHERE id = $1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;