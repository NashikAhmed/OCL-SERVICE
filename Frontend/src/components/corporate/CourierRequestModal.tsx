import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Truck, 
  MapPin, 
  Clock, 
  Phone, 
  Package,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourierRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  corporateName: string;
  corporateContact: string;
}

const CourierRequestModal: React.FC<CourierRequestModalProps> = ({
  isOpen,
  onClose,
  corporateName,
  corporateContact
}) => {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    contactPerson: '',
    contactPhone: corporateContact,
    urgency: 'normal',
    specialInstructions: '',
    packageCount: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('corporateToken');
      const response = await fetch('/api/corporate/request-courier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        setIsSubmitted(true);
        
        toast({
          title: "Courier Request Submitted!",
          description: `Request ID: ${result.requestId}. We will send a courier boy to your location shortly. You will receive a confirmation call within 10 minutes.`,
          duration: 5000,
        });

        // Log the request for admin notification
        console.log('🚚 Courier Request Submitted:', {
          corporate: corporateName,
          timestamp: new Date().toISOString(),
          requestId: result.requestId,
          request: formData
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

    } catch (error) {
      console.error('Courier request error:', error);
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit courier request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSubmitted(false);
      setFormData({
        pickupAddress: '',
        contactPerson: '',
        contactPhone: corporateContact,
        urgency: 'normal',
        specialInstructions: '',
        packageCount: 1
      });
      onClose();
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Request Submitted Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Truck className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Courier Request Confirmed
              </h3>
              <p className="text-gray-600 mb-4">
                We have received your courier request for <strong>{corporateName}</strong>. 
                Our team will dispatch a courier boy to your location shortly.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">You will receive a confirmation call within 10 minutes</span>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Please keep your phone accessible for the courier call</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-blue-600">
            <Truck className="h-5 w-5 mr-2" />
            Request a Courier
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickupAddress">Pickup Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Textarea
                id="pickupAddress"
                placeholder="Enter complete pickup address with landmark"
                value={formData.pickupAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                className="pl-10"
                required
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                placeholder="Name of contact person"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="contactPhone"
                  placeholder="10-digit mobile number"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <select
                id="urgency"
                value={formData.urgency}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="immediate">Immediate</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="packageCount">Number of Packages</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="packageCount"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.packageCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, packageCount: parseInt(e.target.value) || 1 }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Any special instructions for the courier (optional)"
              value={formData.specialInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Expected Response Time: 10-15 minutes</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Request Courier
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourierRequestModal;
