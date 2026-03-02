import { useState } from "react";
import { useBeds, Bed } from "@/hooks/useBeds";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BedDouble, Check, X, Edit2 } from "lucide-react";

const BedRoom = () => {
  const { beds, loading, updateBed } = useBeds();
  const { isAdmin } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [notes, setNotes] = useState("");

  const occupied = beds.filter((b) => b.is_occupied).length;
  const available = beds.length - occupied;

  const startEdit = (bed: Bed) => {
    setEditingId(bed.id);
    setPatientName(bed.patient_name ?? "");
    setNotes(bed.notes ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPatientName("");
    setNotes("");
  };

  const handleToggle = async (bed: Bed) => {
    if (!isAdmin) return;
    if (bed.is_occupied) {
      // Free the bed
      const { error } = await updateBed(bed.id, { is_occupied: false, patient_name: "", notes: "" });
      if (error) toast.error("Failed to update bed");
      else toast.success(`Bed ${bed.bed_number} is now available`);
    } else {
      startEdit(bed);
    }
  };

  const handleSave = async (bed: Bed) => {
    const { error } = await updateBed(bed.id, {
      is_occupied: true,
      patient_name: patientName.trim(),
      notes: notes.trim(),
    });
    if (error) toast.error("Failed to update bed");
    else toast.success(`Bed ${bed.bed_number} marked as occupied`);
    cancelEdit();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading beds...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
          <BedDouble className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{beds.length} Total</span>
        </div>
        <Badge variant="secondary" className="text-sm py-1.5 px-3">
          ✅ {available} Available
        </Badge>
        <Badge variant="destructive" className="text-sm py-1.5 px-3">
          🔴 {occupied} Occupied
        </Badge>
      </div>

      {!isAdmin && (
        <p className="text-xs text-muted-foreground">Only administrators can update bed status.</p>
      )}

      {/* Bed grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {beds.map((bed) => {
          const isEditing = editingId === bed.id;

          return (
            <div
              key={bed.id}
              className={`rounded-lg border p-4 transition-colors ${
                bed.is_occupied
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BedDouble className={`h-5 w-5 ${bed.is_occupied ? "text-destructive" : "text-primary"}`} />
                  <span className="font-semibold text-sm">Bed {bed.bed_number}</span>
                </div>
                <Badge variant={bed.is_occupied ? "destructive" : "secondary"} className="text-[10px]">
                  {bed.is_occupied ? "Occupied" : "Available"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mb-3">{bed.label}</p>

              {bed.is_occupied && !isEditing && (
                <div className="text-xs space-y-1 mb-3">
                  {bed.patient_name && (
                    <p><span className="font-medium text-foreground">Patient:</span> {bed.patient_name}</p>
                  )}
                  {bed.notes && (
                    <p><span className="font-medium text-foreground">Notes:</span> {bed.notes}</p>
                  )}
                </div>
              )}

              {isEditing && (
                <div className="space-y-2 mb-3">
                  <Input
                    placeholder="Patient name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleSave(bed)}>
                      <Check className="h-3 w-3" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={cancelEdit}>
                      <X className="h-3 w-3" /> Cancel
                    </Button>
                  </div>
                </div>
              )}

              {isAdmin && !isEditing && (
                <Button
                  size="sm"
                  variant={bed.is_occupied ? "outline" : "default"}
                  className="w-full h-7 text-xs gap-1"
                  onClick={() => handleToggle(bed)}
                >
                  {bed.is_occupied ? (
                    <><X className="h-3 w-3" /> Free Bed</>
                  ) : (
                    <><Edit2 className="h-3 w-3" /> Mark Occupied</>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BedRoom;
