import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, UserX, Eye } from "lucide-react";
import { useChildren, useCreateChild, useUpdateChild, useDeleteChild, Child } from "@/hooks/useChildren";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useParents } from "@/hooks/useUsers";
import { useCreateChildParent } from "@/hooks/useChildParent";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const StudentManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [classroomFilter, setClassroomFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Child | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    classroom_id: "",
    parent_id: "",
    allergies: "",
    medical_notes: "",
    emergency_contact: "",
  });

  const { data: children = [], isLoading } = useChildren();
  const { data: classrooms = [] } = useClassrooms();
  const { data: parents = [] } = useParents();
  
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const deleteChild = useDeleteChild();
  const createChildParent = useCreateChildParent();

  const filteredStudents = children.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesClassroom = classroomFilter === "all" || student.classroom_id === classroomFilter;
    return matchesSearch && matchesClassroom;
  });

  const getClassroomName = (classroomId: string | null) => {
    if (!classroomId) return "Unassigned";
    const classroom = classrooms.find((c) => c.id === classroomId);
    return classroom ? classroom.name : "Unassigned";
  };

  const handleEdit = (student: Child) => {
    setSelectedStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      date_of_birth: student.date_of_birth,
      classroom_id: student.classroom_id || "",
      parent_id: "",
      allergies: student.allergies || "",
      medical_notes: student.medical_notes || "",
      emergency_contact: student.emergency_contact || "",
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedStudent(null);
    setFormData({
      first_name: "",
      last_name: "",
      date_of_birth: "",
      classroom_id: "",
      parent_id: "",
      allergies: "",
      medical_notes: "",
      emergency_contact: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedStudent) {
        await updateChild.mutateAsync({
          id: selectedStudent.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          classroom_id: formData.classroom_id || null,
          allergies: formData.allergies || null,
          medical_notes: formData.medical_notes || null,
          emergency_contact: formData.emergency_contact || null,
        });
        toast.success("Student updated successfully");
      } else {
        const newChild = await createChild.mutateAsync({
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          classroom_id: formData.classroom_id || null,
          allergies: formData.allergies || null,
          medical_notes: formData.medical_notes || null,
          emergency_contact: formData.emergency_contact || null,
        });
        
        // Link parent if selected
        if (formData.parent_id && newChild) {
          await createChildParent.mutateAsync({
            child_id: newChild.id,
            parent_id: formData.parent_id,
            is_primary: true,
            relationship: 'parent',
          });
        }
        
        toast.success("Student enrolled successfully");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save student");
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    try {
      await deleteChild.mutateAsync(selectedStudent.id);
      toast.success("Student deactivated successfully");
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to deactivate student");
    }
  };

  const openDeleteDialog = (student: Child) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Student Management"
          description="Manage student records, enrollments, and parent associations"
        />

        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={classroomFilter} onValueChange={setClassroomFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Classrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classrooms</SelectItem>
                {classrooms.map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedStudent ? "Edit Student" : "Add New Student"}
                </DialogTitle>
                <DialogDescription>
                  {selectedStudent
                    ? "Update student information"
                    : "Enroll a new student in Compo"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classroom">Classroom</Label>
                    <Select 
                      value={formData.classroom_id} 
                      onValueChange={(value) => setFormData({ ...formData, classroom_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select classroom" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {classrooms.map((classroom) => (
                          <SelectItem key={classroom.id} value={classroom.id}>
                            {classroom.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {!selectedStudent && (
                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent/Guardian</Label>
                    <Select 
                      value={formData.parent_id} 
                      onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No parent linked</SelectItem>
                        {parents.map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="List any allergies"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medical">Medical Notes</Label>
                  <Textarea
                    id="medical"
                    value={formData.medical_notes}
                    onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                    placeholder="Any medical conditions or notes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Input
                    id="emergency"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="Emergency contact name and phone"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.first_name || !formData.last_name || !formData.date_of_birth || createChild.isPending || updateChild.isPending}
                >
                  {selectedStudent ? "Save Changes" : "Enroll Student"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Classroom</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {student.first_name[0]}{student.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-muted-foreground">
                            DOB: {new Date(student.date_of_birth).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{calculateAge(student.date_of_birth)} years</TableCell>
                    <TableCell>{getClassroomName(student.classroom_id)}</TableCell>
                    <TableCell>
                      {student.allergies ? (
                        <Badge variant="destructive" className="text-xs">
                          {student.allergies.length > 20 ? student.allergies.substring(0, 20) + '...' : student.allergies}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.is_active ? "default" : "secondary"}>
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/teacher/student/${student.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDeleteDialog(student)}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {children.length} students
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Deactivate Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to deactivate <strong>{selectedStudent?.first_name} {selectedStudent?.last_name}</strong>? 
              They will be removed from the active student list.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteChild.isPending}
            >
              Deactivate Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentManagementPage;
