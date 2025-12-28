import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { mockMessages, mockUsers, getUserById } from '@/lib/mockData';
import { Send, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const MessagesPage: React.FC = () => {
  const [selectedConvo, setSelectedConvo] = useState<string | null>('parent-1');
  const [newMessage, setNewMessage] = useState('');

  const conversations = mockUsers.filter(u => u.role === 'parent').slice(0, 3);
  const messages = mockMessages.filter(m => m.senderId === selectedConvo || m.recipientId === selectedConvo);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <DashboardLayout>
      <PageHeader title="Messages" description="Communicate with parents and teachers" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="shadow-card overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-10" />
            </div>
          </div>
          <div className="overflow-y-auto">
            {conversations.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedConvo(user.id)}
                className={cn(
                  'w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left',
                  selectedConvo === user.id && 'bg-primary/5 border-l-4 border-l-primary'
                )}
              >
                <Avatar><AvatarFallback className="bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">Click to view messages</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2 shadow-card flex flex-col">
          {selectedConvo ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar><AvatarFallback className="bg-primary/10 text-primary">{getInitials(getUserById(selectedConvo)?.name || '')}</AvatarFallback></Avatar>
                <div>
                  <p className="font-semibold">{getUserById(selectedConvo)?.name}</p>
                  <p className="text-xs text-muted-foreground">Parent</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                  const isOwn = msg.senderId !== selectedConvo;
                  return (
                    <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[70%] p-3 rounded-2xl', isOwn ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm')}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn('text-xs mt-1', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                          {format(new Date(msg.timestamp), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button className="gap-2"><Send className="h-4 w-4" /></Button>
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
