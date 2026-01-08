import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useClassrooms } from '@/hooks/useClassrooms';
import { useUsers } from '@/hooks/useUsers';
import { 
  useAnnouncements, 
  useCreateAnnouncement, 
  useUpdateAnnouncement, 
  useDeleteAnnouncement 
} from '@/hooks/useAnnouncements';
import { Plus, Pin, Calendar, Edit, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AnnouncementsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    is_pinned: false,
    event_date: '',
    classroom_id: 'all',
  });

  const { data: announcements = [], isLoading } = useAnnouncements();
  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useClassrooms();
  const { data: users = [] } = useUsers();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const canManage = role === 'teacher' || role === 'admin';

  const handleCreate = async () => {
    if (!user?.id) return;
    
    try {
      const classroomId = formData.classroom_id === 'all' ? null : formData.classroom_id;
      
      await createAnnouncement.mutateAsync({
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        is_pinned: formData.is_pinned,
        event_date: formData.event_date || null,
        classroom_id: classroomId,
        created_by: user.id,
      });
      toast.success('Announcement created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create announcement');
    }
  };

  const handleEdit = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      const classroomId = formData.classroom_id === 'all' ? null : formData.classroom_id;
      
      await updateAnnouncement.mutateAsync({
        id: selectedAnnouncement.id,
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        is_pinned: formData.is_pinned,
        event_date: formData.event_date || null,
        classroom_id: classroomId,
      });
      toast.success('Announcement updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update announcement');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnouncement.mutateAsync(id);
      toast.success('Announcement deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete announcement');
    }
  };

  const openEditDialog = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority || 'normal',
      is_pinned: announcement.is_pinned || false,
      event_date: announcement.event_date || '',
      classroom_id: announcement.classroom_id || 'all',
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      is_pinned: false,
      event_date: '',
      classroom_id: 'all',
    });
    setSelectedAnnouncement(null);
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const getAuthorName = (authorId: string) => {
    const author = users.find(u => u.id === authorId);
    return author?.full_name || 'Unknown';
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Announcements"
        description="View and manage announcements"
        actions={
          canManage && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetForm}>
                  <Plus className="h-4 w-4" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="create-title">Title</Label>
                    <Input
                      id="create-title"
                      placeholder="Announcement title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-content">Content</Label>
                    <Textarea
                      id="create-content"
                      placeholder="Announcement content..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="create-priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger id="create-priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="create-classroom">Classroom (Optional)</Label>
                      {isLoadingClassrooms ? (
                        <Skeleton className="h-10 w-full" />
                      ) : classrooms.length === 0 ? (
                        <div className="border rounded-md p-2 text-sm text-muted-foreground bg-muted/50">
                          No classrooms available
                        </div>
                      ) : (
                        <Select
                          value={formData.classroom_id}
                          onValueChange={(value) => setFormData({ ...formData, classroom_id: value })}
                        >
                          <SelectTrigger id="create-classroom">
                            <SelectValue placeholder="All classrooms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All classrooms</SelectItem>
                            {classrooms.map((classroom) => (
                              <SelectItem key={classroom.id} value={classroom.id}>
                                {classroom.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="create-event-date">Event Date (Optional)</Label>
                    <Input
                      id="create-event-date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="create-pinned"
                      checked={formData.is_pinned}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
                    />
                    <Label htmlFor="create-pinned">Pin this announcement</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!formData.title || !formData.content || createAnnouncement.isPending}
                  >
                    {createAnnouncement.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      />
      
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))
        ) : announcements.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center text-muted-foreground">
              No announcements yet
            </CardContent>
          </Card>
        ) : (
          announcements.map(ann => (
            <Card key={ann.id} className={cn('shadow-card', ann.is_pinned && 'border-l-4 border-l-primary')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {ann.is_pinned && <Pin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{ann.title}</h3>
                          <Badge className={getPriorityColor(ann.priority || 'normal')}>
                            {ann.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{format(new Date(ann.created_at || ''), 'MMM d, yyyy')}</span>
                          {ann.event_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Event: {format(new Date(ann.event_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                      {canManage && ann.created_by === user?.id && (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(ann)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(ann.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-foreground mb-4">{ann.content}</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(getAuthorName(ann.created_by))}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {getAuthorName(ann.created_by)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                placeholder="Announcement content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-classroom">Classroom (Optional)</Label>
                {isLoadingClassrooms ? (
                  <Skeleton className="h-10 w-full" />
                ) : classrooms.length === 0 ? (
                  <div className="border rounded-md p-2 text-sm text-muted-foreground bg-muted/50">
                    No classrooms available
                  </div>
                ) : (
                  <Select
                    value={formData.classroom_id}
                    onValueChange={(value) => setFormData({ ...formData, classroom_id: value })}
                  >
                    <SelectTrigger id="edit-classroom">
                      <SelectValue placeholder="All classrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All classrooms</SelectItem>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          {classroom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-event-date">Event Date (Optional)</Label>
              <Input
                id="edit-event-date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-pinned"
                checked={formData.is_pinned}
                onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
              />
              <Label htmlFor="edit-pinned">Pin this announcement</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.title || !formData.content || updateAnnouncement.isPending}
            >
              {updateAnnouncement.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AnnouncementsPage;