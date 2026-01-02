import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getChildrenByParent, 
  mockDocuments, 
  getChildById,
  Document 
} from '@/lib/mockData';
import { 
  Upload,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Filter,
  AlertTriangle,
  File
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const DocumentsPortalPage: React.FC = () => {
  const children = getChildrenByParent('parent-1');
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const childIds = children.map(c => c.id);

  // Extended mock documents
  const allDocuments: Document[] = [
    ...mockDocuments,
    { id: 'doc-7', childId: 'child-5', name: 'Birth Certificate', type: 'identification', status: 'approved', submittedDate: '2024-09-15' },
    { id: 'doc-8', childId: 'child-5', name: 'Medical Insurance Card', type: 'medical', status: 'pending', dueDate: '2025-01-20' },
    { id: 'doc-9', childId: 'child-1', name: 'Field Trip Permission', type: 'consent', status: 'pending', dueDate: '2025-01-05' },
  ];

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesChild = selectedChild === 'all' ? childIds.includes(doc.childId) : doc.childId === selectedChild;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesChild && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    const icons = {
      approved: <CheckCircle className="h-4 w-4 text-success" />,
      pending: <Clock className="h-4 w-4 text-warning" />,
      submitted: <AlertCircle className="h-4 w-4 text-primary" />,
      rejected: <XCircle className="h-4 w-4 text-destructive" />,
      expired: <AlertTriangle className="h-4 w-4 text-destructive" />
    };
    return icons[status as keyof typeof icons] || <File className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      submitted: 'bg-primary/10 text-primary',
      rejected: 'bg-destructive/10 text-destructive',
      expired: 'bg-destructive/10 text-destructive'
    };
    return styles[status as keyof typeof styles] || '';
  };

  const getDueDateWarning = (dueDate?: string) => {
    if (!dueDate) return null;
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return { text: 'Overdue', color: 'text-destructive' };
    if (days <= 7) return { text: `Due in ${days} days`, color: 'text-warning' };
    return null;
  };

  const stats = {
    pending: filteredDocuments.filter(d => d.status === 'pending').length,
    submitted: filteredDocuments.filter(d => d.status === 'submitted').length,
    approved: filteredDocuments.filter(d => d.status === 'approved').length,
    expired: filteredDocuments.filter(d => d.status === 'expired' || d.status === 'rejected').length
  };

  const handleUpload = (doc: Document) => {
    setSelectedDocument(doc);
    setUploadDialogOpen(true);
  };

  const handleSubmitUpload = () => {
    if (!uploadFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Document uploaded",
      description: `${selectedDocument?.name} has been submitted for review.`
    });
    setUploadFile(null);
    setUploadDialogOpen(false);
    setSelectedDocument(null);
  };

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    setPreviewDialogOpen(true);
  };

  const handleDownload = (doc: Document) => {
    toast({
      title: "Downloading",
      description: `${doc.name} is being downloaded.`
    });
  };

  const handleResubmit = (doc: Document) => {
    setSelectedDocument(doc);
    setUploadDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Documents Portal"
        description="Manage required documents for your children"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-xl">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.submitted}</p>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-xl">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-xl">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.expired}</p>
              <p className="text-sm text-muted-foreground">Action Needed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card mb-6">
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
                {children.map(child => (
                  <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
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
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No documents found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredDocuments.map(doc => {
                const child = getChildById(doc.childId);
                const warning = getDueDateWarning(doc.dueDate);

                return (
                  <div key={doc.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-muted rounded-xl">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{doc.name}</h3>
                          <Badge className={getStatusBadge(doc.status)}>
                            {getStatusIcon(doc.status)}
                            <span className="ml-1 capitalize">{doc.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {child?.name} • {doc.type}
                        </p>
                        {doc.dueDate && (
                          <p className={cn('text-sm', warning?.color)}>
                            Due: {format(parseISO(doc.dueDate), 'MMM d, yyyy')}
                            {warning && ` (${warning.text})`}
                          </p>
                        )}
                        {doc.submittedDate && (
                          <p className="text-sm text-muted-foreground">
                            Submitted: {format(parseISO(doc.submittedDate), 'MMM d, yyyy')}
                          </p>
                        )}
                        {doc.notes && (
                          <p className="text-sm text-destructive mt-1">{doc.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                      {(doc.status === 'pending' || doc.status === 'expired') && (
                        <Button onClick={() => handleUpload(doc)} className="gap-2">
                          <Upload className="h-4 w-4" />
                          Upload
                        </Button>
                      )}
                      {doc.status === 'rejected' && (
                        <Button onClick={() => handleResubmit(doc)} variant="outline" className="gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Resubmit
                        </Button>
                      )}
                      {(doc.status === 'submitted' || doc.status === 'approved') && (
                        <>
                          <Button variant="outline" size="icon" onClick={() => handlePreview(doc)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDownload(doc)}>
                            <Download className="h-4 w-4" />
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
                <p className="font-medium">{selectedDocument.name}</p>
                <p className="text-sm text-muted-foreground">
                  For: {getChildById(selectedDocument.childId)?.name}
                </p>
              </div>
            )}
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG, DOC up to 10MB
                </p>
              </label>
              {uploadFile && (
                <div className="mt-4 p-2 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium">{uploadFile.name}</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitUpload} disabled={!uploadFile}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedDocument && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedDocument.name}</h3>
                  <p className="text-sm text-muted-foreground">Type: {selectedDocument.type}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="capitalize">{selectedDocument.status}</span>
                  </p>
                  {selectedDocument.submittedDate && (
                    <p className="text-sm text-muted-foreground">
                      Submitted: {format(parseISO(selectedDocument.submittedDate), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Document Preview</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>Close</Button>
            <Button onClick={() => selectedDocument && handleDownload(selectedDocument)} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DocumentsPortalPage;
