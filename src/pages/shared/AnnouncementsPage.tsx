import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { AnnouncementCard } from '@/components/ui/announcement-card';
import { Button } from '@/components/ui/button';
import { mockAnnouncements } from '@/lib/mockData';
import { Plus } from 'lucide-react';

const AnnouncementsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader
        title="Announcements"
        description="View and manage announcements"
        actions={<Button className="gap-2"><Plus className="h-4 w-4" />New Announcement</Button>}
      />
      <div className="space-y-4">
        {mockAnnouncements.map(ann => (
          <AnnouncementCard key={ann.id} announcement={ann} />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AnnouncementsPage;
