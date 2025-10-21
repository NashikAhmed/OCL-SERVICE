import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  response?: string;
  responseDate?: string;
}

const ComplaintDesk: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const [newComplaint, setNewComplaint] = useState({
    subject: '',
    category: '',
    priority: '',
    description: '',
  });

  const { toast } = useToast();

  const handleSubmitComplaint = async () => {
    if (!newComplaint.subject || !newComplaint.category || !newComplaint.priority || !newComplaint.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In real implementation, this would make an API call
      const complaint: Complaint = {
        id: Date.now().toString(),
        subject: newComplaint.subject,
        category: newComplaint.category,
        priority: newComplaint.priority,
        status: 'Open',
        description: newComplaint.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setComplaints(prev => [complaint, ...prev]);
      
      setNewComplaint({
        subject: '',
        category: '',
        priority: '',
        description: '',
      });

      toast({
        title: "Success",
        description: "Your complaint has been submitted successfully. We will get back to you soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit complaint. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge variant="destructive">Open</Badge>;
      case 'In Progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'Resolved':
        return <Badge variant="default">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Complaint Desk
          </h1>
          <p className="text-sm text-gray-600">Submit and track your complaints and feedback</p>
        </div>
      </div>

      {/* Submit New Complaint */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-blue-50 border-b border-gray-200 py-2">
          <CardTitle className="text-base font-semibold text-gray-800">Submit New Complaint</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="subject" className="text-xs font-medium">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={newComplaint.subject}
                  onChange={(e) => setNewComplaint(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your complaint"
                  className="w-full h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="category" className="text-xs font-medium">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newComplaint.category}
                  onValueChange={(value) => setNewComplaint(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-full h-8">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delivery">Delivery Issues</SelectItem>
                    <SelectItem value="Billing">Billing & Payment</SelectItem>
                    <SelectItem value="Damage">Package Damage</SelectItem>
                    <SelectItem value="Service">Service Quality</SelectItem>
                    <SelectItem value="Tracking">Tracking Issues</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="priority" className="text-xs font-medium">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newComplaint.priority}
                onValueChange={(value) => setNewComplaint(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="w-full h-8">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High - Urgent attention required</SelectItem>
                  <SelectItem value="Medium">Medium - Normal processing</SelectItem>
                  <SelectItem value="Low">Low - Can be addressed later</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs font-medium">
                Detailed Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={newComplaint.description}
                onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide detailed information about your complaint..."
                className="w-full min-h-[80px]"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComplaint}
                disabled={isSubmitting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-3 w-3 mr-1" />
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-green-50 border-b border-gray-200 py-2">
          <CardTitle className="text-base font-semibold text-gray-800">Need Immediate Assistance?</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Phone Support</p>
                <p className="text-xs text-gray-600">+91 98765 43210</p>
                <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Email Support</p>
                <p className="text-xs text-gray-600">support@ocl.com</p>
                <p className="text-xs text-gray-500">24/7 Response</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Live Chat</p>
                <p className="text-xs text-gray-600">Available Now</p>
                <p className="text-xs text-gray-500">Instant Support</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaint History */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200 py-2">
          <CardTitle className="text-base font-semibold text-gray-800">Your Complaints</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {complaints.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No complaints submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {complaints.map((complaint, index) => (
                <div
                  key={complaint.id}
                  className={`p-3 ${index !== complaints.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{complaint.subject}</h3>
                        {getStatusBadge(complaint.status)}
                        {getPriorityBadge(complaint.priority)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{complaint.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Submitted: {formatDate(complaint.createdAt)}</span>
                        </div>
                        {complaint.updatedAt !== complaint.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Updated: {formatDate(complaint.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{complaint.description}</p>
                      
                      {complaint.response && (
                        <Alert className="bg-green-50 border-green-200 p-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <AlertDescription>
                            <div className="font-medium text-green-800 mb-1 text-xs">Response from Support:</div>
                            <p className="text-green-700 text-xs">{complaint.response}</p>
                            {complaint.responseDate && (
                              <p className="text-xs text-green-600 mt-1">
                                Responded on: {formatDate(complaint.responseDate)}
                              </p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintDesk;
