import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Users, 
  Edit,
  Trash2,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { useParents, useDeactivateUser } from '@/hooks/useUsers';
import { useChildren } from '@/hooks/useChildren';
import { useCreateChildParent, useDeleteChildParent } from '@/hooks/useChildParent';
import { useCreateUser } from '@/hooks/useAdminUsers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ParentWithChildren {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  last_login: string | null;
  is_active: boolean;
  children: Array<{
    id: string;
    first_name: string;
    last_name: string;
    classroom_id: string | null;
  }>;
}

const ParentManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLinkChildDialogOpen, setIsLinkChildDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [selectedChildForLink, setSelectedChildForLink] = useState<string | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const { toast } = useToast();
  
  // Hooks
  const { data: parents = [], isLoading: loadingParents, refetch: refetchParents } = useParents();
  const { data: allChildren = [], isLoading: loadingChildren } = useChildren();
  const createUser = useCreateUser();
  const createChildParent = useCreateChildParent();
  const deleteChildParent = useDeleteChildParent();
  const deactivateUser = useDeactivateUser();

  // Get children linked to each parent
  const [parentsWithChildren, setParentsWithChildren] = useState<ParentWithChildren[]>([]);
  
  React.useEffect(() => {
    const fetchParentsWithChildren = async () => {
      if (!parents.length) return;
      
      const parentsData = await Promise.all(
        parents.map(async (parent) => {
          const { data: links } = await supabase
            .from('child_parent')
            .select(`
              child_id,
              children:child_id (
                id,
                first_name,
                last_name,
                classroom_id
              )
            `)
            .eq('parent_id', parent.id);
          
          const children = links?.map(link => link.children).filter(Boolean) || [];
          
          return {
            ...parent,
            children
          } as ParentWithChildren;
        })
      );
      
      setParentsWithChildren(parentsData);
    };
    
    fetchParentsWithChildren();
  }, [parents]);

  const filteredParents = parentsWithChildren.filter(parent =>
    parent.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleAddParent = async () => {
    if (!firstName || !lastName || !email) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const tempPassword = password || generatePassword();
      
      await createUser.mutateAsync({
        email,
        password: tempPassword,
        full_name: `${firstName} ${lastName}`,
        role: 'parent',
        phone: phone || undefined
      });

      toast({
        title: "Success",
        description: `Parent added successfully. ${!password ? 'They will receive a confirmation email.' : ''}`
      });

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setIsAddDialogOpen(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add parent",
        variant: "destructive"
      });
    }
  };

  const handleLinkChild = async () => {
    if (!selectedParent || !selectedChildForLink) {
      toast({
        title: "Missing selection",
        description: "Please select a child to link",
        variant: "destructive"
      });
      return;
    }

    // Check if already linked
    const parent = parentsWithChildren.find(p => p.id === selectedParent);
    if (parent?.children.some(c => c.id === selectedChildForLink)) {
      toast({
        title: "Already linked",
        description: "This child is already linked to the parent",
        variant: "destructive"
      });
      return;
    }

    try {
      await createChildParent.mutateAsync({
        child_id: selectedChildForLink,
        parent_id: selectedParent,
        relationship: 'guardian',
        is_primary: false
      });

      toast({
        title: "Success",
        description: "Child linked to parent successfully"
      });

      setIsLinkChildDialogOpen(false);
      setSelectedChildForLink(null);
      refetchParents();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to link child",
        variant: "destructive"
      });
    }
  };

  const handleUnlinkChild = async (parentId: string, childId: string) => {
    if (!confirm('Are you sure you want to unlink this child from the parent?')) {
      return;
    }

    try {
      await deleteChildParent.mutateAsync({ childId, parentId });
      
      toast({
        title: "Success",
        description: "Child unlinked successfully"
      });
      
      refetchParents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unlink child",
        variant: "destructive"
      });
    }
  };

  const handleDeleteParent = async (parentId: string) => {
    if (!confirm('Are you sure you want to deactivate this parent account?')) {
      return;
    }

    try {
      await deactivateUser.mutateAsync(parentId);

      toast({
        title: "Success",
        description: "Parent account deactivated"
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate parent",
        variant: "destructive"
      });
    }
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Calculate stats
  const activeParents = parentsWithChildren.filter(p => p.is_active).length;
  const unlinkedParents = parentsWithChildren.filter(p => p.children.length === 0).length;

  if (loadingParents || loadingChildren) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Parent Management"
        description="Manage parent accounts and link them to children"
        actions={
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Parent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Parent</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="parent@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Temporary Password <span className="text-muted-foreground text-xs">(leave empty to auto-generate)</span>
                    </Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Optional"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    * Parent will receive a confirmation email to verify their account
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setFirstName('');
                        setLastName('');
                        setEmail('');
                        setPhone('');
                        setPassword('');
                      }}
                      disabled={createUser.isPending}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddParent} disabled={createUser.isPending}>
                      {createUser.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Parent'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Parents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parentsWithChildren.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeParents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {parentsWithChildren.length - unlinkedParents}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unlinked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{unlinkedParents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search parents by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Parents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Children</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No parents found matching your search' : 'No parents yet. Add your first parent to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredParents.map((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(parent.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{parent.full_name}</div>
                          <div className="text-sm text-muted-foreground">{parent.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {parent.email}
                        </div>
                        {parent.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {parent.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{parent.children.length} {parent.children.length === 1 ? 'child' : 'children'}</span>
                      </div>
                      {parent.children.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {parent.children.map(c => `${c.first_name} ${c.last_name}`).join(', ')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={parent.is_active ? "default" : "secondary"}>
                        {parent.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatLastLogin(parent.last_login)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedParent(parent.id);
                            setIsLinkChildDialogOpen(true);
                          }}>
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Link Child
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => handleDeleteParent(parent.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Link Child Dialog */}
      <Dialog open={isLinkChildDialogOpen} onOpenChange={(open) => {
        setIsLinkChildDialogOpen(open);
        if (!open) {
          setSelectedChildForLink(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link Child to Parent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Child</Label>
              {allChildren.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No children available to link
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allChildren.map((child) => {
                    const parent = parentsWithChildren.find(p => p.id === selectedParent);
                    const isAlreadyLinked = parent?.children.some(c => c.id === child.id);
                    
                    return (
                      <div 
                        key={child.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg ${
                          isAlreadyLinked 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-accent cursor-pointer'
                        } ${
                          selectedChildForLink === child.id ? 'bg-accent border-primary' : ''
                        }`}
                        onClick={() => !isAlreadyLinked && setSelectedChildForLink(child.id)}
                      >
                        <Avatar>
                          <AvatarFallback>{getInitials(`${child.first_name} ${child.last_name}`)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{child.first_name} {child.last_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {isAlreadyLinked ? 'Already linked' : child.classroom_id ? 'Assigned to classroom' : 'Unassigned'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsLinkChildDialogOpen(false);
                setSelectedChildForLink(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleLinkChild} 
                disabled={!selectedChildForLink || createChildParent.isPending}
              >
                {createChildParent.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Linking...
                  </>
                ) : (
                  'Link Child'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ParentManagementPage;
