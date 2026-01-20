import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { 
  useConversation, 
  useSendMessage, 
  useMarkConversationAsRead 
} from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { Send, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);

  const { data: users = [] } = useUsers();
  const { data: messages = [], refetch: refetchMessages } = useConversation(user?.id, selectedConvo || undefined);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkConversationAsRead();

  // Get conversations (users who have exchanged messages with current user)
  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      // Get all users except current user who are relevant (parents for teachers, teachers for parents)
      const relevantUsers = users.filter(u => {
        if (user.role === 'teacher' || user.role === 'admin') {
          return u.role === 'parent';
        }
        return u.role === 'teacher' || u.role === 'admin';
      });
      setConversations(relevantUsers);
    };

    fetchConversations();
  }, [user, users]);

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
      .channel('messages-realtime')
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
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = users.find(u => u.id === selectedConvo);

  return (
    <DashboardLayout>
      <div className='p-4 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
      <PageHeader title="Messages" description="Communicate with parents and teachers" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-130px)]">
        {/* Conversations List */}
        <Card className="shadow-card overflow-hidden">
          <div className="p-4 border-b  bg-[#97CFCA]">
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
          <div className="overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations found
              </div>
            ) : (
              filteredConversations.map(convoUser => (
                <button
                  key={convoUser.id}
                  onClick={() => setSelectedConvo(convoUser.id)}
                  className={cn(
                    'w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left',
                    selectedConvo === convoUser.id && 'bg-primary/5 border-l-4 border-l-primary'
                  )}
                >
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">{getInitials(convoUser.full_name)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{convoUser.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate capitalize">{convoUser.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2 shadow-card flex flex-col ">
          {selectedConvo && selectedUser ? (
            <>
              <div className="p-4 border-b flex items-center gap-3  bg-[#97CFCA]">
                <Avatar><AvatarFallback className="bg-white text-primary">{getInitials(selectedUser.full_name)}</AvatarFallback></Avatar>
                <div>
                  <p className="font-extrabold text-slate-700">{selectedUser.full_name}</p>
                  <p className="text-xs text-muted-foreground font-semibold capitalize">{selectedUser.role}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                        <div className={cn('max-w-[70%] p-3 rounded-2xl', isOwn ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm')}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={cn('text-xs mt-1', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                            {format(new Date(msg.created_at || ''), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  className="gap-2" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessage.isPending}
                >
                  {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
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

export default MessagesPage;
