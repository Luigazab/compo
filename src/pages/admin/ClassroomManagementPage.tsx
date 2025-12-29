import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Edit, Archive, Users } from "lucide-react";
import { mockClassrooms, mockUsers, mockChildren } from "@/lib/mockData";

const ClassroomManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);

  const teachers = mockUsers.filter((u) => u.role === "teacher");

  const filteredClassrooms = mockClassrooms.filter(
    (classroom) =>
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.ageGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeacherName = (teacherId: string) => {
    const teacher = mockUsers.find((u) => u.id === teacherId);
    return teacher ? teacher.name : "Unassigned";
  };

  const getStudentCount = (classroomId: string) => {
    return mockChildren.filter((c) => c.classroomId === classroomId).length;
  };

  const handleEdit = (classroom: any) => {
    setSelectedClassroom(classroom);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedClassroom(null);
    setIsDialogOpen(true);
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
                    defaultValue={selectedClassroom?.name}
                    placeholder="e.g., Sunshine Room"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <Select defaultValue={selectedClassroom?.ageGroup}>
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
                    defaultValue={selectedClassroom?.capacity}
                    placeholder="e.g., 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher">Assign Teacher</Label>
                  <Select defaultValue={selectedClassroom?.teacherId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  {selectedClassroom ? "Save Changes" : "Create Classroom"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredClassrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{classroom.name}</h3>
                  <p className="text-sm text-muted-foreground">{classroom.ageGroup}</p>
                </div>
                <Badge variant="secondary">
                  {getStudentCount(classroom.id)}/{classroom.capacity}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Teacher: {getTeacherName(classroom.teacherId)}</span>
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
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

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
              {filteredClassrooms.map((classroom) => {
                const studentCount = getStudentCount(classroom.id);
                const isFull = studentCount >= classroom.capacity;
                return (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium">{classroom.name}</TableCell>
                    <TableCell>{classroom.ageGroup}</TableCell>
                    <TableCell>{getTeacherName(classroom.teacherId)}</TableCell>
                    <TableCell>{studentCount}</TableCell>
                    <TableCell>{classroom.capacity}</TableCell>
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
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassroomManagementPage;
