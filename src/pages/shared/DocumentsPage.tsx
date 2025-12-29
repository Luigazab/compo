import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  mockDocuments,
  mockChildren,
  getChildById,
  getChildrenByParent,
  getChildrenByClassroom,
  mockClassrooms,
  Document,
} from "@/lib/mockData";
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
  Calendar,
  Search,
} from "lucide-react";
import { format, parseISO, isBefore, addDays } from "date-fns";

const getStatusColor = (status: Document["status"]) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "submitted":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "pending":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "rejected":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "expired":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: Document["status"]) => {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-4 w-4" />;
    case "submitted":
      return <Clock className="h-4 w-4" />;
    case "pending":
      return <AlertTriangle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    case "expired":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const DocumentCard = ({
  doc,
  childName,
  isTeacher,
  onUpload,
  onApprove,
  onReject,
  onSendReminder,
}: {
  doc: Document;
  childName: string;
  isTeacher: boolean;
  onUpload: (docId: string) => void;
  onApprove: (docId: string) => void;
  onReject: (docId: string) => void;
  onSendReminder: (docId: string) => void;
}) => {
  const isOverdue = doc.dueDate && isBefore(parseISO(doc.dueDate), new Date()) && doc.status === "pending";
  const isDueSoon =
    doc.dueDate &&
    !isOverdue &&
    isBefore(parseISO(doc.dueDate), addDays(new Date(), 7)) &&
    doc.status === "pending";

  return (
    <Card className={`${isOverdue ? "border-destructive/50" : isDueSoon ? "border-yellow-500/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
              <p className="text-sm text-muted-foreground">{childName}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className={getStatusColor(doc.status)}>
                  {getStatusIcon(doc.status)}
                  <span className="ml-1 capitalize">{doc.status}</span>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {doc.type}
                </Badge>
              </div>
              {doc.dueDate && (
                <p className={`text-xs mt-2 flex items-center gap-1 ${isOverdue ? "text-destructive" : isDueSoon ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}`}>
                  <Calendar className="h-3 w-3" />
                  Due: {format(parseISO(doc.dueDate), "MMM d, yyyy")}
                  {isOverdue && " (Overdue!)"}
                  {isDueSoon && " (Due soon)"}
                </p>
              )}
              {doc.submittedDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted: {format(parseISO(doc.submittedDate), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {isTeacher ? (
              <>
                {doc.status === "submitted" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => onApprove(doc.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => onReject(doc.id)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {(doc.status === "pending" || doc.status === "expired") && (
                  <Button size="sm" variant="outline" onClick={() => onSendReminder(doc.id)}>
                    <Send className="h-4 w-4 mr-1" />
                    Remind
                  </Button>
                )}
                {doc.status === "approved" && (
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
              </>
            ) : (
              <>
                {(doc.status === "pending" || doc.status === "rejected" || doc.status === "expired") && (
                  <Button size="sm" onClick={() => onUpload(doc.id)}>
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                )}
                {(doc.status === "submitted" || doc.status === "approved") && (
                  <>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {doc.notes && (
          <p className="text-sm text-muted-foreground mt-3 p-2 bg-muted/50 rounded-md">
            Note: {doc.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const DocumentsPage = () => {
  const { role, user } = useAuth();
  const isTeacher = role === "teacher";
  const isParent = role === "parent";

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Get relevant children based on role
  let relevantChildren = mockChildren;
  if (isTeacher && user) {
    const teacherClassroom = mockClassrooms.find((c) => c.teacherId === user.id);
    if (teacherClassroom) {
      relevantChildren = getChildrenByClassroom(teacherClassroom.id);
    }
  } else if (isParent && user) {
    relevantChildren = getChildrenByParent(user.id);
  }

  const relevantChildIds = relevantChildren.map((c) => c.id);

  // Filter documents
  const filteredDocuments = mockDocuments.filter((doc) => {
    if (!relevantChildIds.includes(doc.childId)) return false;
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;
    if (searchQuery) {
      const child = getChildById(doc.childId);
      const searchLower = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(searchLower) ||
        child?.name.toLowerCase().includes(searchLower) ||
        doc.type.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Group by status for stats
  const stats = {
    pending: mockDocuments.filter((d) => relevantChildIds.includes(d.childId) && d.status === "pending").length,
    submitted: mockDocuments.filter((d) => relevantChildIds.includes(d.childId) && d.status === "submitted").length,
    approved: mockDocuments.filter((d) => relevantChildIds.includes(d.childId) && d.status === "approved").length,
    expired: mockDocuments.filter((d) => relevantChildIds.includes(d.childId) && d.status === "expired").length,
  };

  const handleUpload = (docId: string) => {
    setSelectedDocId(docId);
    setIsUploadDialogOpen(true);
  };

  const handleApprove = (docId: string) => {
    console.log("Approving document:", docId);
  };

  const handleReject = (docId: string) => {
    console.log("Rejecting document:", docId);
  };

  const handleSendReminder = (docId: string) => {
    console.log("Sending reminder for document:", docId);
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
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.expired}</p>
                <p className="text-sm text-red-600 dark:text-red-500">Expired</p>
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
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isTeacher && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Requirement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Document Requirement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Document Name</Label>
                    <Input placeholder="e.g., Annual Health Check" />
                  </div>
                  <div>
                    <Label>Document Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="administrative">Administrative</SelectItem>
                        <SelectItem value="consent">Consent</SelectItem>
                        <SelectItem value="identification">Identification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Student</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {relevantChildren.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea placeholder="Any additional instructions..." />
                  </div>
                  <Button className="w-full" onClick={() => setIsCreateDialogOpen(false)}>
                    Create Requirement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Documents List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="action">Needs Action</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    childName={getChildById(doc.childId)?.name || "Unknown"}
                    isTeacher={isTeacher}
                    onUpload={handleUpload}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onSendReminder={handleSendReminder}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="action" className="space-y-4">
            {filteredDocuments.filter((d) =>
              isTeacher
                ? d.status === "submitted"
                : ["pending", "rejected", "expired"].includes(d.status)
            ).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                  <p>No documents require your action!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredDocuments
                  .filter((d) =>
                    isTeacher
                      ? d.status === "submitted"
                      : ["pending", "rejected", "expired"].includes(d.status)
                  )
                  .map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      childName={getChildById(doc.childId)?.name || "Unknown"}
                      isTeacher={isTeacher}
                      onUpload={handleUpload}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onSendReminder={handleSendReminder}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredDocuments.filter((d) => d.status === "approved").length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No completed documents yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredDocuments
                  .filter((d) => d.status === "approved")
                  .map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      childName={getChildById(doc.childId)?.name || "Unknown"}
                      isTeacher={isTeacher}
                      onUpload={handleUpload}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onSendReminder={handleSendReminder}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <Input type="file" className="max-w-xs mx-auto" />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea placeholder="Any additional notes about this document..." />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => setIsUploadDialogOpen(false)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DocumentsPage;
