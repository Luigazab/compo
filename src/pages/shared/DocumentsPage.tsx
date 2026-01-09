import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments, useCreateDocument, useUpdateDocument, useUploadDocument } from "@/hooks/useDocuments";
import { useChildren } from "@/hooks/useChildren";
import { useChildParents } from "@/hooks/useChildParent";
import { useTeacherClassrooms } from "@/hooks/useClassrooms";
import {
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "submitted":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "pending":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-4 w-4" />;
    case "submitted":
      return <Clock className="h-4 w-4" />;
    case "pending":
      return <AlertTriangle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const DocumentsPage = () => {
  const { role, user } = useAuth();
  const isTeacher = role === "teacher" || role === "admin";
  const isParent = role === "parent";

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    document_type: '',
    child_id: '',
    due_date: '',
  });

  const { data: documents = [], isLoading } = useDocuments();
  const { data: children = [] } = useChildren();
  const { data: childParentLinks = [] } = useChildParents();
  const { data: teacherClassrooms = [] } = useTeacherClassrooms(isTeacher ? user?.id : undefined);
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const uploadDocument = useUploadDocument();

  // Get relevant children based on role - supports multi-classroom teachers
  const getRelevantChildren = () => {
    if (isTeacher && user) {
      // Get all classroom IDs the teacher is assigned to
      const teacherClassroomIds = teacherClassrooms.map(c => c.id);
      if (teacherClassroomIds.length > 0) {
        return children.filter((c) => c.classroom_id && teacherClassroomIds.includes(c.classroom_id));
      }
      return children;
    } else if (isParent && user) {
      const parentChildIds = childParentLinks
        .filter((cp) => cp.parent_id === user.id)
        .map((cp) => cp.child_id);
      return children.filter((c) => parentChildIds.includes(c.id));
    }
    return children;
  };

  const relevantChildren = getRelevantChildren();
  const relevantChildIds = relevantChildren.map((c) => c.id);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    if (!relevantChildIds.includes(doc.child_id)) return false;
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;
    if (searchQuery) {
      const child = children.find((c) => c.id === doc.child_id);
      const searchLower = searchQuery.toLowerCase();
      return (
        doc.document_type.toLowerCase().includes(searchLower) ||
        child?.first_name.toLowerCase().includes(searchLower) ||
        child?.last_name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Group by status for stats
  const stats = {
    pending: documents.filter((d) => relevantChildIds.includes(d.child_id) && d.status === "pending").length,
    submitted: documents.filter((d) => relevantChildIds.includes(d.child_id) && d.status === "submitted").length,
    approved: documents.filter((d) => relevantChildIds.includes(d.child_id) && d.status === "approved").length,
    rejected: documents.filter((d) => relevantChildIds.includes(d.child_id) && (d.status === "rejected")).length,
  };

  const handleCreateDocument = async () => {
    try {
      await createDocument.mutateAsync({
        document_type: formData.document_type,
        child_id: formData.child_id,
        due_date: formData.due_date || null,
        status: 'pending',
      });
      toast.success('Document requirement created');
      setIsCreateDialogOpen(false);
      setFormData({ document_type: '', child_id: '', due_date: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create document');
    }
  };

  const handleUpload = (docId: string, childId: string) => {
    setSelectedDocId(docId);
    setSelectedChildId(childId);
    setIsUploadDialogOpen(true);
  };

  const handleSubmitUpload = async () => {
    if (!uploadFile || !selectedDocId || !selectedChildId) return;
    
    try {
      await uploadDocument.mutateAsync({
        documentId: selectedDocId,
        file: uploadFile,
        childId: selectedChildId,
      });
      toast.success('Document uploaded successfully');
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      setSelectedDocId(null);
      setSelectedChildId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    }
  };

  const handleApprove = async (docId: string) => {
    try {
      await updateDocument.mutateAsync({ id: docId, status: 'approved' });
      toast.success('Document approved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve document');
    }
  };

  const handleReject = async (docId: string) => {
    try {
      await updateDocument.mutateAsync({ id: docId, status: 'rejected' });
      toast.success('Document rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject document');
    }
  };

  const getChildName = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    return child ? `${child.first_name} ${child.last_name}` : 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Documents Portal"
          description={isTeacher ? "Manage student document requirements and submissions" : "View and upload required documents for your children"}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.submitted}</p>
                <p className="text-sm text-blue-600 dark:text-blue-500">Submitted</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.approved}</p>
                <p className="text-sm text-green-600 dark:text-green-500">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</p>
                <p className="text-sm text-red-600 dark:text-red-500">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter status" />
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
          {isTeacher && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Requirement
            </Button>
          )}
        </div>

        {/* Documents List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents found matching your criteria.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{doc.document_type}</h4>
                        <p className="text-sm text-muted-foreground">{getChildName(doc.child_id)}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className={getStatusColor(doc.status || 'pending')}>
                            {getStatusIcon(doc.status || 'pending')}
                            <span className="ml-1 capitalize">{doc.status || 'pending'}</span>
                          </Badge>
                        </div>
                        {doc.due_date && (
                          <p className="text-xs mt-2 text-muted-foreground">
                            Due: {format(new Date(doc.due_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isTeacher ? (
                        <>
                          {doc.status === "submitted" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleApprove(doc.id)}>
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleReject(doc.id)}>
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {doc.file_url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </a>
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          {(doc.status === "pending" || doc.status === "rejected") && (
                            <Button size="sm" onClick={() => handleUpload(doc.id, doc.child_id)}>
                              <Upload className="h-4 w-4 mr-1" />
                              Upload
                            </Button>
                          )}
                          {doc.file_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </a>
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Document Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Document Requirement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Document Type</Label>
                <Input
                  placeholder="e.g., Medical Certificate"
                  value={formData.document_type}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                />
              </div>
              <div>
                <Label>Student</Label>
                <Select
                  value={formData.child_id}
                  onValueChange={(value) => setFormData({ ...formData, child_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {relevantChildren.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.first_name} {child.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateDocument}
                disabled={!formData.document_type || !formData.child_id || createDocument.isPending}
              >
                {createDocument.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSubmitUpload}
                disabled={!uploadFile || uploadDocument.isPending}
              >
                {uploadDocument.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DocumentsPage;
