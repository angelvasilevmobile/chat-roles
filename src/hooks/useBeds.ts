import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Bed {
  id: string;
  bed_number: number;
  label: string;
  is_occupied: boolean;
  patient_name: string;
  notes: string;
  updated_at: string;
}

export const useBeds = () => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBeds = async () => {
    const { data } = await supabase
      .from("beds")
      .select("*")
      .order("bed_number");
    setBeds((data as Bed[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBeds();

    const channel = supabase
      .channel("beds-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "beds" }, () => {
        fetchBeds();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateBed = async (id: string, updates: Partial<Pick<Bed, "is_occupied" | "patient_name" | "notes">>) => {
    const { error } = await supabase.from("beds").update(updates).eq("id", id);
    return { error };
  };

  return { beds, loading, updateBed };
};
