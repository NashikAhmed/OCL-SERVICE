import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, FileText, Plus, Trash2 } from 'lucide-react';

interface AdditionalCharge {
  id: string;
  description: string;
  amount: string;
}

interface QuotationFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  origin: string;
  destination: string;
  weight: string;
  ratePerKg: string;
  gstRate: string;
  additionalCharges: AdditionalCharge[];
}

const SingleQuotation = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<QuotationFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    origin: '',
    destination: '',
    weight: '',
    ratePerKg: '45',
    gstRate: '18',
    additionalCharges: []
  });

  const handleInputChange = (field: keyof QuotationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAdditionalCharge = () => {
    const newCharge: AdditionalCharge = {
      id: Date.now().toString(),
      description: '',
      amount: ''
    };
    setFormData(prev => ({
      ...prev,
      additionalCharges: [...prev.additionalCharges, newCharge]
    }));
  };

  const removeAdditionalCharge = (id: string) => {
    setFormData(prev => ({
      ...prev,
      additionalCharges: prev.additionalCharges.filter(charge => charge.id !== id)
    }));
  };

  const updateAdditionalCharge = (id: string, field: keyof AdditionalCharge, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalCharges: prev.additionalCharges.map(charge =>
        charge.id === id ? { ...charge, [field]: value } : charge
      )
    }));
  };

  const calculateTotal = () => {
    const weight = parseFloat(formData.weight) || 0;
    const ratePerKg = parseFloat(formData.ratePerKg) || 0;
    const gstRate = parseFloat(formData.gstRate) || 0;
    
    const baseAmount = weight * ratePerKg;
    const additionalChargesTotal = formData.additionalCharges.reduce((sum, charge) => {
      return sum + (parseFloat(charge.amount) || 0);
    }, 0);
    
    const subtotal = baseAmount + additionalChargesTotal;
    const gstAmount = (subtotal * gstRate) / 100;
    const totalAmount = subtotal + gstAmount;
    
    return {
      baseAmount: baseAmount.toFixed(2),
      additionalChargesTotal: additionalChargesTotal.toFixed(2),
      subtotal: subtotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerName || !formData.customerEmail || !formData.origin || !formData.destination || !formData.weight) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/generate-quotation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Quotation Sent",
          description: `Quotation PDF has been sent to ${formData.customerEmail}`,
        });
        
        // Reset form
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          origin: '',
          destination: '',
          weight: '',
          ratePerKg: '45',
          gstRate: '18',
          additionalCharges: []
        });
      } else {
        throw new Error(result.error || 'Failed to generate quotation');
      }
    } catch (error) {
      console.error('Error generating quotation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quotation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculations = calculateTotal();

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-sm sm:text-base">Quick Quotation Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Customer & Service Info - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="customerName" className="text-xs sm:text-sm font-medium text-gray-700">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Customer name"
                  className="h-11 sm:h-10 text-sm shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="customerEmail" className="text-xs sm:text-sm font-medium text-gray-700">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="email@example.com"
                  className="h-11 sm:h-10 text-sm shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="customerPhone" className="text-xs sm:text-sm font-medium text-gray-700">Phone</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="+91 9876543210"
                  className="h-11 sm:h-10 text-sm shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="weight" className="text-xs sm:text-sm font-medium text-gray-700">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="0.0"
                  className="h-11 sm:h-10 text-sm shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Origin & Destination - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="origin" className="text-xs sm:text-sm font-medium text-gray-700">Origin *</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  placeholder="e.g., Guwahati"
                  className="h-11 sm:h-10 text-sm shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="destination" className="text-xs sm:text-sm font-medium text-gray-700">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="e.g., Amravati, Hyderabad"
                  className="h-11 sm:h-10 text-sm shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Pricing - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="ratePerKg" className="text-xs sm:text-sm font-medium text-gray-700">Rate/kg (₹)</Label>
                <Input
                  id="ratePerKg"
                  type="number"
                  step="0.01"
                  value={formData.ratePerKg}
                  onChange={(e) => handleInputChange('ratePerKg', e.target.value)}
                  placeholder="45.00"
                  className="h-11 sm:h-10 text-sm shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="gstRate" className="text-xs sm:text-sm font-medium text-gray-700">GST (%)</Label>
                <Input
                  id="gstRate"
                  type="number"
                  step="0.01"
                  value={formData.gstRate}
                  onChange={(e) => handleInputChange('gstRate', e.target.value)}
                  placeholder="18.00"
                  className="h-11 sm:h-10 text-sm shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
            </div>

            {/* Additional Charges Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Additional Charges</h3>
                <Button
                  type="button"
                  onClick={addAdditionalCharge}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 h-8 text-xs font-medium shadow-sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Charge
                </Button>
              </div>
              
              {formData.additionalCharges.map((charge, index) => (
                <div key={charge.id} className="grid grid-cols-3 gap-3 items-end">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">Description</Label>
                    <Input
                      value={charge.description}
                      onChange={(e) => updateAdditionalCharge(charge.id, 'description', e.target.value)}
                      placeholder="e.g., Fuel surcharge, Insurance"
                      className="h-8 text-sm shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">Amount (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={charge.amount}
                      onChange={(e) => updateAdditionalCharge(charge.id, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="h-8 text-sm shadow-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => removeAdditionalCharge(charge.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 h-8 text-xs"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Calculation - Modern Design */}
            {formData.weight && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl shadow-sm border border-green-100">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Base Amount</span>
                    </div>
                    <span className="font-semibold text-gray-800">₹{calculations.baseAmount}</span>
                  </div>
                  
                  {formData.additionalCharges.length > 0 && (
                    <>
                      {formData.additionalCharges.map((charge, index) => (
                        <div key={charge.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-gray-600">{charge.description || `Charge ${index + 1}`}</span>
                          </div>
                          <span className="font-semibold text-gray-800">₹{parseFloat(charge.amount || '0').toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-gray-600">Additional Charges Total</span>
                        </div>
                        <span className="font-semibold text-gray-800">₹{calculations.additionalChargesTotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-t border-green-200 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-gray-600">Subtotal</span>
                        </div>
                        <span className="font-semibold text-gray-800">₹{calculations.subtotal}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">GST ({formData.gstRate}%)</span>
                    </div>
                    <span className="font-semibold text-gray-800">₹{calculations.gstAmount}</span>
                  </div>
                  
                  <div className="border-t border-green-200 mt-3 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-800">Total Amount</span>
                      <span className="font-bold text-xl text-green-600">₹{calculations.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 h-12 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Generate Quotation
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SingleQuotation;
