import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useChildren } from '@/hooks/useChildren';
import { useChildParents } from '@/hooks/useChildParent';
import { useClassrooms } from '@/hooks/useClassrooms';
import { 
  useConversation, 
  useSendMessage, 
  useMarkConversationAsRead 
} from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { Send, Search, Check, CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ParentMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [] } = useUsers();
  const { data: children = [] } = useChildren();
  const { data: childParentLinks = [] } = useChildParents();
  const { data: classrooms = [] } = useClassrooms();
  const { data: messages = [], refetch: refetchMessages } = useConversation(user?.id, selectedConvo || undefined);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkConversationAsRead();

  // Get parent's children
  const parentChildren = children.filter(child => 
    childParentLinks.some(cp => cp.parent_id === user?.id && cp.child_id === child.id)
  );

  // Get teachers from children's classrooms
  const teacherIds = new Set(
    parentChildren.map(c => {
      const classroom = classrooms.find(cl => cl.id === c.classroom_id);
      return classroom?.teacher_id;
    }).filter(Boolean)
  );
  const teachers = users.filter(u => teacherIds.has(u.id));

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConvo && user?.id) {
      markAsRead.mutate({ userId: user.id, otherUserId: selectedConvo });
    }
  }, [selectedConvo, user?.id]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('parent-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetchMessages]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConvo || !user?.id) return;
    
    try {
      await sendMessage.mutateAsync({
        sender_id: user.id,
        recipient_id: selectedConvo,
        content: newMessage,
      });
      setNewMessage('');
      refetchMessages();
      toast.success('Message sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = users.find(u => u.id === selectedConvo);

  return (
    <DashboardLayout>
      <PageHeader 
        title="Messages" 
        description="Communicate with your children's teachers"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="shadow-card overflow-hidden flex flex-col">
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Inbox</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredTeachers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No teachers found
              </div>
            ) : (
              filteredTeachers.map(teacher => (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedConvo(teacher.id)}
                  className={cn(
                    'w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left',
                    selectedConvo === teacher.id && 'bg-primary/5 border-l-4 border-l-primary'
                  )}
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(teacher.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{teacher.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">Teacher</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2 shadow-card flex flex-col">
          {selectedConvo && selectedUser ? (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedUser.full_name}</p>
                  <p className="text-xs text-muted-foreground">Teacher</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.sender_id === user?.id;
                    
                    return (
                      <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                        <div className={cn(
                          'max-w-[70%] p-3 rounded-2xl',
                          isOwn 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-muted rounded-bl-sm'
                        )}>
                          <p className="text-sm">{msg.content}</p>
                          <div className={cn(
                            'flex items-center gap-1 justify-end mt-1',
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            <span className="text-xs">
                              {format(new Date(msg.created_at || ''), 'h:mm a')}
                            </span>
                            {isOwn && (
                              msg.is_read 
                                ? <CheckCheck className="h-3 w-3" />
                                : <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || sendMessage.isPending}
                  >
                    {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ParentMessagesPage;
