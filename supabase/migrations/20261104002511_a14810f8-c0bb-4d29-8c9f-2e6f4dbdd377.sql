GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_absences TO authenticated;
CREATE POLICY "Admins can insert absences" ON public.collection_absences FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update absences" ON public.collection_absences FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete absences" ON public.collection_absences FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));