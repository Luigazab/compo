import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";
import { useClassrooms, useCreateClassroom, useUpdateClassroom, useDeleteClassroom, Classroom } from "@/hooks/useClassrooms";
import { useTeachers } from "@/hooks/useUsers";
import { useChildren } from "@/hooks/useChildren";
import { toast } from "sonner";

const ClassroomManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    age_group: "",
    capacity: 20,
    teacher_id: "",
  });

  const { data: classrooms = [], isLoading } = useClassrooms();
  const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachers();
  const { data: children = [] } = useChildren();
  
  const createClassroom = useCreateClassroom();
  const updateClassroom = useUpdateClassroom();
  const deleteClassroom = useDeleteClassroom();

  const filteredClassrooms = classrooms.filter(
    (classroom) =>
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classroom.age_group?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return "Unassigned";
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.full_name : "Unassigned";
  };

  const getStudentCount = (classroomId: string) => {
    return children.filter((c) => c.classroom_id === classroomId).length;
  };

  const handleEdit = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setFormData({
      name: classroom.name,
      age_group: classroom.age_group || "",
      capacity: classroom.capacity || 20,
      teacher_id: classroom.teacher_id || "unassigned",
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedClassroom(null);
    setFormData({ name: "", age_group: "", capacity: 20, teacher_id: "unassigned" });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // Convert "unassigned" back to null for database
      const teacherId = formData.teacher_id === "unassigned" ? null : formData.teacher_id;
      
      if (selectedClassroom) {
        await updateClassroom.mutateAsync({
          id: selectedClassroom.id,
          name: formData.name,
          age_group: formData.age_group || null,
          capacity: formData.capacity,
          teacher_id: teacherId,
        });
        toast.success("Classroom updated successfully");
      } else {
        await createClassroom.mutateAsync({
          name: formData.name,
          age_group: formData.age_group || null,
          capacity: formData.capacity,
          teacher_id: teacherId,
        });
        toast.success("Classroom created successfully");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save classroom");
    }
  };

  const handleDelete = async () => {
    if (!selectedClassroom) return;
    try {
      await deleteClassroom.mutateAsync(selectedClassroom.id);
      toast.success("Classroom deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedClassroom(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete classroom");
    }
  };

  const openDeleteDialog = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Classroom Management"
          description="Manage classrooms, assign teachers, and organize students"
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classrooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Classroom
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedClassroom ? "Edit Classroom" : "Add New Classroom"}
                </DialogTitle>
                <DialogDescription>
                  {selectedClassroom
                    ? "Update classroom details"
                    : "Create a new classroom for your daycare"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Classroom Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Sunshine Room"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <Select 
                    value={formData.age_group} 
                    onValueChange={(value) => setFormData({ ...formData, age_group: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infants (0-1)">Infants (0-1)</SelectItem>
                      <SelectItem value="Toddlers (1-2)">Toddlers (1-2)</SelectItem>
                      <SelectItem value="Twos (2-3)">Twos (2-3)</SelectItem>
                      <SelectItem value="Preschool (3-4)">Preschool (3-4)</SelectItem>
                      <SelectItem value="Pre-K (4-5)">Pre-K (4-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 20 })}
                    placeholder="e.g., 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher">Assign Teacher (Optional)</Label>
                  {isLoadingTeachers ? (
                    <Skeleton className="h-10 w-full" />
                  ) : teachers.length === 0 ? (
                    <div className="border rounded-md p-2 text-sm text-muted-foreground bg-muted/50">
                      No teachers available. You can assign a teacher later.
                    </div>
                  ) : (
                    <Select 
                      value={formData.teacher_id} 
                      onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!formData.name || createClassroom.isPending || updateClassroom.isPending}
                >
                  {selectedClassroom ? "Save Changes" : "Create Classroom"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredClassrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{classroom.name}</h3>
                    <p className="text-sm text-muted-foreground">{classroom.age_group || 'No age group'}</p>
                  </div>
                  <Badge variant="secondary">
                    {getStudentCount(classroom.id)}/{classroom.capacity || 20}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Teacher: {getTeacherName(classroom.teacher_id)}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(classroom)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDeleteDialog(classroom)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Classroom</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ) : filteredClassrooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No classrooms found
                  </TableCell>
                </TableRow>
              ) : (
                filteredClassrooms.map((classroom) => {
                  const studentCount = getStudentCount(classroom.id);
                  const isFull = studentCount >= (classroom.capacity || 20);
                  return (
                    <TableRow key={classroom.id}>
                      <TableCell className="font-medium">{classroom.name}</TableCell>
                      <TableCell>{classroom.age_group || '—'}</TableCell>
                      <TableCell>{getTeacherName(classroom.teacher_id)}</TableCell>
                      <TableCell>{studentCount}</TableCell>
                      <TableCell>{classroom.capacity || 20}</TableCell>
                      <TableCell>
                        <Badge variant={isFull ? "destructive" : "default"}>
                          {isFull ? "Full" : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(classroom)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Classroom</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete <strong>{selectedClassroom?.name}</strong>? This action cannot be undone.
            </p>
            {selectedClassroom && getStudentCount(selectedClassroom.id) > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  ⚠️ This classroom has {getStudentCount(selectedClassroom.id)} students assigned. Please reassign them first.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteClassroom.isPending}
            >
              Delete Classroom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClassroomManagementPage;