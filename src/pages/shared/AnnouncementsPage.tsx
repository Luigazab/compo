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
    classroom_id: '',
  });

  const { data: announcements = [], isLoading } = useAnnouncements();
  const { data: classrooms = [] } = useClassrooms();
  const { data: users = [] } = useUsers();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const canManage = role === 'teacher' || role === 'admin';

  const handleCreate = async () => {
    if (!user?.id) return;
    
    try {
      await createAnnouncement.mutateAsync({
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        is_pinned: formData.is_pinned,
        event_date: formData.event_date || null,
        classroom_id: formData.classroom_id || null,
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
      await updateAnnouncement.mutateAsync({
        id: selectedAnnouncement.id,
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        is_pinned: formData.is_pinned,
        event_date: formData.event_date || null,
        classroom_id: formData.classroom_id || null,
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
      classroom_id: announcement.classroom_id || '',
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
      classroom_id: '',
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

  const AnnouncementForm = ({ onSubmit, isEdit = false }: { onSubmit: () => void; isEdit?: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          placeholder="Announcement title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          placeholder="Announcement content..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
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
          <Label>Classroom (Optional)</Label>
          <Select
            value={formData.classroom_id}
            onValueChange={(value) => setFormData({ ...formData, classroom_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All classrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All classrooms</SelectItem>
              {classrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Event Date (Optional)</Label>
        <Input
          type="date"
          value={formData.event_date}
          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_pinned}
          onCheckedChange={(checked) => setFormData({ ...formData, is_pinned: checked })}
        />
        <Label>Pin this announcement</Label>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => isEdit ? setIsEditDialogOpen(false) : setIsCreateDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!formData.title || !formData.content || createAnnouncement.isPending || updateAnnouncement.isPending}
        >
          {(createAnnouncement.isPending || updateAnnouncement.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogFooter>
    </div>
  );

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
                <AnnouncementForm onSubmit={handleCreate} />
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
          <AnnouncementForm onSubmit={handleEdit} isEdit />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AnnouncementsPage;
