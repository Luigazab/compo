import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments, useUploadDocument } from '@/hooks/useDocuments';
import { useChildren } from '@/hooks/useChildren';
import { useChildParents } from '@/hooks/useChildParent';
import { 
  Upload,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Filter,
  Loader2
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DocumentsPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data: children = [] } = useChildren();
  const { data: childParentLinks = [] } = useChildParents();
  const { data: documents = [], isLoading } = useDocuments();
  const uploadDocument = useUploadDocument();

  // Get parent's children
  const parentChildIds = childParentLinks
    .filter(cp => cp.parent_id === user?.id)
    .map(cp => cp.child_id);
  const parentChildren = children.filter(c => parentChildIds.includes(c.id));

  const childIds = selectedChild === 'all' 
    ? parentChildIds 
    : [selectedChild];

  const filteredDocuments = documents.filter(doc => {
    const matchesChild = childIds.includes(doc.child_id);
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesChild && matchesStatus;
  });

  const getStatusIcon = (status: string | null) => {
    const icons: Record<string, JSX.Element> = {
      approved: <CheckCircle className="h-4 w-4 text-green-600" />,
      pending: <Clock className="h-4 w-4 text-yellow-600" />,
      submitted: <AlertCircle className="h-4 w-4 text-blue-600" />,
      rejected: <XCircle className="h-4 w-4 text-red-600" />
    };
    return icons[status || 'pending'] || <FileText className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string | null) => {
    const styles: Record<string, string> = {
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return styles[status || 'pending'] || '';
  };

  const getDueDateWarning = (dueDate?: string | null) => {
    if (!dueDate) return null;
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return { text: 'Overdue', color: 'text-destructive' };
    if (days <= 7) return { text: `Due in ${days} days`, color: 'text-yellow-600' };
    return null;
  };

  const stats = {
    pending: filteredDocuments.filter(d => d.status === 'pending').length,
    submitted: filteredDocuments.filter(d => d.status === 'submitted').length,
    approved: filteredDocuments.filter(d => d.status === 'approved').length,
    rejected: filteredDocuments.filter(d => d.status === 'rejected').length
  };

  const handleUpload = (doc: any) => {
    setSelectedDocument(doc);
    setUploadDialogOpen(true);
  };

  const handleSubmitUpload = async () => {
    if (!uploadFile || !selectedDocument) return;
    
    try {
      await uploadDocument.mutateAsync({
        documentId: selectedDocument.id,
        file: uploadFile,
        childId: selectedDocument.child_id,
      });
      toast.success('Document uploaded successfully');
      setUploadFile(null);
      setUploadDialogOpen(false);
      setSelectedDocument(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    }
  };

  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child ? `${child.first_name} ${child.last_name}` : 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className='p-4 md:p-0 bg-[#97CFCA] md:bg-transparent rounded-lg mb-6 shadow-lg md:shadow-none'>
      <PageHeader
        title="Documents Portal"
        description="Manage required documents for your children"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.submitted}</p>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {parentChildren.map(child => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.first_name} {child.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Documents List */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No documents found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredDocuments.map(doc => {
                const warning = getDueDateWarning(doc.due_date);

                return (
                  <div key={doc.id} className="p-4 flex flex-row items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-muted rounded-xl">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{doc.document_type}</h3>
                          <Badge className={getStatusBadge(doc.status)}>
                            {getStatusIcon(doc.status)}
                            <span className="ml-1 capitalize">{doc.status || 'pending'}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getChildName(doc.child_id)}
                        </p>
                        {doc.due_date && (
                          <p className={cn('text-sm', warning?.color)}>
                            Due: {format(parseISO(doc.due_date), 'MMM d, yyyy')}
                            {warning && ` (${warning.text})`}
                          </p>
                        )}
                        {doc.submission_date && (
                          <p className="text-sm text-muted-foreground">
                            Submitted: {format(parseISO(doc.submission_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                      {(doc.status === 'pending' || doc.status === 'rejected') && (
                        <Button onClick={() => handleUpload(doc)} className="gap-2">
                          <Upload className="h-4 w-4" />
                          Upload
                        </Button>
                      )}
                      {(doc.status === 'submitted' || doc.status === 'approved') && doc.file_url && (
                        <>
                          <Button variant="outline" size="icon" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <a href={doc.file_url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedDocument && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedDocument.document_type}</p>
                <p className="text-sm text-muted-foreground">
                  For: {getChildName(selectedDocument.child_id)}
                </p>
              </div>
            )}
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Accepted formats: PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitUpload} 
              disabled={!uploadFile || uploadDocument.isPending}
            >
              {uploadDocument.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DocumentsPortalPage;
