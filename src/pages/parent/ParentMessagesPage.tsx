import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  mockMessages, 
  mockUsers, 
  getUserById, 
  getChildrenByParent, 
  getChildById,
  getClassroomById,
  mockClassrooms
} from '@/lib/mockData';
import { Send, Search, Check, CheckCheck, Filter, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const ParentMessagesPage: React.FC = () => {
  const [selectedConvo, setSelectedConvo] = useState<string | null>('teacher-1');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [childFilter, setChildFilter] = useState<string>('all');
  const [messages, setMessages] = useState(mockMessages);

  const children = getChildrenByParent('parent-1');
  
  // Get teachers from children's classrooms
  const teacherIds = new Set(
    children.map(c => getClassroomById(c.classroomId)?.teacherId).filter(Boolean)
  );
  const teachers = mockUsers.filter(u => teacherIds.has(u.id));

  // Get conversations (messages grouped by teacher)
  const conversations = teachers.map(teacher => {
    const teacherMessages = messages.filter(
      m => m.senderId === teacher.id || m.recipientId === teacher.id
    );
    const lastMessage = teacherMessages[teacherMessages.length - 1];
    const unreadCount = teacherMessages.filter(
      m => m.senderId === teacher.id && !m.read
    ).length;

    return {
      teacher,
      lastMessage,
      unreadCount
    };
  });

  // Filter messages for selected conversation
  const conversationMessages = messages.filter(
    m => m.senderId === selectedConvo || m.recipientId === selectedConvo
  ).filter(m => 
    childFilter === 'all' || m.childId === childFilter
  ).filter(m =>
    searchQuery === '' || m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConvo) return;
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: 'parent-1',
      recipientId: selectedConvo,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    toast({
      title: "Message sent",
      description: "Your message has been delivered."
    });
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

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
              {totalUnread > 0 && (
                <Badge className="bg-primary">{totalUnread} unread</Badge>
              )}
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
            {conversations.map(({ teacher, lastMessage, unreadCount }) => (
              <button
                key={teacher.id}
                onClick={() => setSelectedConvo(teacher.id)}
                className={cn(
                  'w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left',
                  selectedConvo === teacher.id && 'bg-primary/5 border-l-4 border-l-primary'
                )}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(teacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">{teacher.name}</p>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(lastMessage.timestamp), 'h:mm a')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2 shadow-card flex flex-col">
          {selectedConvo ? (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(getUserById(selectedConvo)?.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{getUserById(selectedConvo)?.name}</p>
                    <p className="text-xs text-muted-foreground">Teacher</p>
                  </div>
                </div>
                {children.length > 1 && (
                  <Select value={childFilter} onValueChange={setChildFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by child" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Children</SelectItem>
                      {children.map(child => (
                        <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  conversationMessages.map(msg => {
                    const isOwn = msg.senderId !== selectedConvo;
                    const child = msg.childId ? getChildById(msg.childId) : null;
                    
                    return (
                      <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                        <div className={cn(
                          'max-w-[70%] p-3 rounded-2xl',
                          isOwn 
                            ? 'bg-primary text-primary-foreground rounded-br-sm' 
                            : 'bg-muted rounded-bl-sm'
                        )}>
                          {child && (
                            <p className={cn(
                              'text-xs mb-1',
                              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}>
                              Re: {child.name}
                            </p>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <div className={cn(
                            'flex items-center gap-1 justify-end mt-1',
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            <span className="text-xs">
                              {format(parseISO(msg.timestamp), 'h:mm a')}
                            </span>
                            {isOwn && (
                              msg.read 
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
                {children.length > 1 && (
                  <div className="flex gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">About:</span>
                    {children.map(child => (
                      <Badge 
                        key={child.id}
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => setNewMessage(prev => `[Re: ${child.name}] ${prev}`)}
                      >
                        {child.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
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
