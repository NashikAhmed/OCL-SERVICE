import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Loader2, AlertCircle, CheckCircle, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PricingData {
  _id: string;
  name: string;
  status: string;
  doxPricing: {
    '01gm-250gm': {
      assam: number;
      neBySurface: number;
      neByAirAgtImp: number;
      restOfIndia: number;
    };
    '251gm-500gm': {
      assam: number;
      neBySurface: number;
      neByAirAgtImp: number;
      restOfIndia: number;
    };
    add500gm: {
      assam: number;
      neBySurface: number;
      neByAirAgtImp: number;
      restOfIndia: number;
    };
  };
  nonDoxSurfacePricing: {
    assam: number;
    neBySurface: number;
    neByAirAgtImp: number;
    restOfIndia: number;
  };
  nonDoxAirPricing: {
    assam: number;
    neBySurface: number;
    neByAirAgtImp: number;
    restOfIndia: number;
  };
  priorityPricing: {
    '01gm-500gm': {
      assam: number;
      neBySurface: number;
      neByAirAgtImp: number;
      restOfIndia: number;
    };
    add500gm: {
      assam: number;
      neBySurface: number;
      neByAirAgtImp: number;
      restOfIndia: number;
    };
  };
  reversePricing: {
    toAssam: {
      byRoad: {
        normal: number;
        priority: number;
      };
      byTrain: {
        normal: number;
        priority: number;
      };
      byFlight: {
        normal: number;
        priority: number;
      };
    };
    toNorthEast: {
      byRoad: {
        normal: number;
        priority: number;
      };
      byTrain: {
        normal: number;
        priority: number;
      };
      byFlight: {
        normal: number;
        priority: number;
      };
    };
  };
  createdAt: string;
  approvedAt?: string;
}

const CorporatePricingDisplay: React.FC = () => {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Testing section state (from admin component)
  const [testInputs, setTestInputs] = useState({
    fromPincode: '',
    destinationPincode: '',
    weight: '',
    type: 'dox', // 'dox' or 'non-dox'
    byAir: false,
    priority: false,
    transportMode: 'byRoad', // 'byRoad', 'byTrain', 'byFlight' for reverse pricing
    deliveryType: 'normal' // 'normal' or 'priority' for reverse pricing
  });

  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const token = localStorage.getItem('corporateToken');
      const response = await fetch('/api/corporate/pricing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPricingData(data.pricing);
      } else if (response.status === 404) {
        setError('No pricing plan has been assigned to your corporate account yet. Please contact your administrator.');
      } else {
        throw new Error('Failed to fetch pricing data');
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      setError('Failed to load pricing information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price ? `₹${price.toFixed(2)}` : 'N/A';
  };

  // Helper functions from admin component
  const isAssamPincode = (pincode: string): boolean => {
    const pin = parseInt(pincode);
    return (pin >= 781000 && pin <= 781999) || 
           (pin >= 782000 && pin <= 782999) || 
           (pin >= 783000 && pin <= 783999) || 
           (pin >= 784000 && pin <= 784999) || 
           (pin >= 785000 && pin <= 785999) || 
           (pin >= 786000 && pin <= 786999) || 
           (pin >= 787000 && pin <= 787999) || 
           (pin >= 788000 && pin <= 788999);
  };

  const isNorthEastPincode = (pincode: string): boolean => {
    const pin = parseInt(pincode);
    return (pin >= 790000 && pin <= 791999) || // Arunachal Pradesh
           (pin >= 793000 && pin <= 793999) || // Meghalaya
           (pin >= 795000 && pin <= 795999) || // Manipur
           (pin >= 796000 && pin <= 796999) || // Mizoram
           (pin >= 797000 && pin <= 797999) || // Nagaland
           (pin >= 737000 && pin <= 737999) || // Sikkim
           (pin >= 799000 && pin <= 799999);   // Tripura
  };

  const classifyLocation = (pincode: string, isAirRoute: boolean = false): string => {
    const pin = parseInt(pincode);
    
    // Assam pincodes (781xxx, 782xxx, 783xxx, 784xxx, 785xxx, 786xxx, 787xxx, 788xxx)
    if ((pin >= 781000 && pin <= 781999) || 
        (pin >= 782000 && pin <= 782999) || 
        (pin >= 783000 && pin <= 783999) || 
        (pin >= 784000 && pin <= 784999) || 
        (pin >= 785000 && pin <= 785999) || 
        (pin >= 786000 && pin <= 786999) || 
        (pin >= 787000 && pin <= 787999) || 
        (pin >= 788000 && pin <= 788999)) {
      return 'assam';
    }
    
    // Kolkata pincodes (700xxx)
    if (pin >= 700000 && pin <= 700999) {
      return 'kol';
    }
    
    // Tripura (799xxx) and Manipur (795xxx) - AGT IMP only for air routes
    if (isAirRoute && ((pin >= 799000 && pin <= 799999) || (pin >= 795000 && pin <= 795999))) {
      return 'neByAirAgtImp';
    }
    
    // Tripura (799xxx) and Manipur (795xxx) - Surface route
    if (!isAirRoute && ((pin >= 799000 && pin <= 799999) || (pin >= 795000 && pin <= 795999))) {
      return 'neBySurface';
    }
    
    // Other NE states (Arunachal Pradesh 790xxx, 791xxx, Nagaland 797xxx, Meghalaya 793xxx, Mizoram 796xxx, Sikkim 737xxx)
    if ((pin >= 790000 && pin <= 791999) || 
        (pin >= 793000 && pin <= 793999) || 
        (pin >= 796000 && pin <= 796999) || 
        (pin >= 797000 && pin <= 797999) || 
        (pin >= 737000 && pin <= 737999)) {
      return 'neBySurface';
    }
    
    // Rest of India
    return 'restOfIndia';
  };

  // Price calculation logic from admin component
  const calculatePrice = () => {
    if (!pricingData) {
      toast({
        title: "Error",
        description: "Pricing data not available",
        variant: "destructive"
      });
      return;
    }

    if (!testInputs.destinationPincode || !testInputs.weight) {
      toast({
        title: "Error",
        description: "Please enter destination pincode and weight",
        variant: "destructive"
      });
      return;
    }

    const weight = parseFloat(testInputs.weight);
    let price = 0;
    let serviceType = testInputs.type.toUpperCase();
    let location = '';
    let transportMode = '';
    let chargeableWeight = weight;
    let isMinimumWeightApplied = false;

    // Check if this is reverse pricing (from pincode provided and destination is Assam/North East)
    if (testInputs.fromPincode && testInputs.type === 'non-dox') {
      // Reverse pricing logic
      const minChargeableWeights = {
        byRoad: 500,
        byTrain: 100,
        byFlight: 25
      };
      
      chargeableWeight = Math.max(weight, minChargeableWeights[testInputs.transportMode as keyof typeof minChargeableWeights]);
      isMinimumWeightApplied = chargeableWeight > weight;

      if (isAssamPincode(testInputs.destinationPincode)) {
        location = 'Assam';
        const pricePerKg = parseFloat(pricingData.reversePricing.toAssam[testInputs.transportMode as keyof typeof pricingData.reversePricing.toAssam][testInputs.deliveryType as keyof typeof pricingData.reversePricing.toAssam.byRoad]) || 0;
        price = pricePerKg * chargeableWeight;
        transportMode = testInputs.transportMode;
      } else if (isNorthEastPincode(testInputs.destinationPincode)) {
        location = 'North East';
        const pricePerKg = parseFloat(pricingData.reversePricing.toNorthEast[testInputs.transportMode as keyof typeof pricingData.reversePricing.toNorthEast][testInputs.deliveryType as keyof typeof pricingData.reversePricing.toNorthEast.byRoad]) || 0;
        price = pricePerKg * chargeableWeight;
        transportMode = testInputs.transportMode;
      } else {
        toast({
          title: "Error",
          description: "Reverse pricing is only available for Assam and North East destinations",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Normal pricing logic
      location = classifyLocation(testInputs.destinationPincode, testInputs.byAir);
    
      if (testInputs.type === 'dox') {
        // DOX pricing logic
        if (testInputs.priority) {
          // Priority Service pricing
          if (weight <= 500) {
            price = parseFloat(pricingData.priorityPricing['01gm-500gm'][location as keyof typeof pricingData.priorityPricing['01gm-500gm']]) || 0;
          } else {
            // For weights above 500gm, use base price + additional 500gm charges
            const basePrice = parseFloat(pricingData.priorityPricing['01gm-500gm'][location as keyof typeof pricingData.priorityPricing['01gm-500gm']]) || 0;
            const additionalWeight = Math.ceil((weight - 500) / 500);
            const additionalPrice = parseFloat(pricingData.priorityPricing.add500gm[location as keyof typeof pricingData.priorityPricing.add500gm]) || 0;
            price = basePrice + (additionalWeight * additionalPrice);
          }
        } else {
          // Standard Service pricing
          if (weight <= 250) {
            price = parseFloat(pricingData.doxPricing['01gm-250gm'][location as keyof typeof pricingData.doxPricing['01gm-250gm']]) || 0;
          } else if (weight <= 500) {
            price = parseFloat(pricingData.doxPricing['251gm-500gm'][location as keyof typeof pricingData.doxPricing['251gm-500gm']]) || 0;
          } else {
            // For weights above 500gm, use base price + additional 500gm charges
            const basePrice = parseFloat(pricingData.doxPricing['251gm-500gm'][location as keyof typeof pricingData.doxPricing['251gm-500gm']]) || 0;
            const additionalWeight = Math.ceil((weight - 500) / 500);
            const additionalPrice = parseFloat(pricingData.doxPricing.add500gm[location as keyof typeof pricingData.doxPricing.add500gm]) || 0;
            price = basePrice + (additionalWeight * additionalPrice);
          }
        }
      } else {
        // NON-DOX pricing logic (per kg)
        if (testInputs.byAir) {
          const pricePerKg = parseFloat(pricingData.nonDoxAirPricing[location as keyof typeof pricingData.nonDoxAirPricing]) || 0;
          price = pricePerKg * weight;
        } else {
          const pricePerKg = parseFloat(pricingData.nonDoxSurfacePricing[location as keyof typeof pricingData.nonDoxSurfacePricing]) || 0;
          price = pricePerKg * weight;
        }
      }
    }
    
    setCalculatedPrice(price);
    
    if (testInputs.priority) serviceType += ' (Priority)';
    if (testInputs.byAir) serviceType += ' (By Air)';
    if (transportMode) serviceType += ` (${transportMode})`;
    
    const fromText = testInputs.fromPincode ? ` from ${testInputs.fromPincode}` : '';
    const weightText = isMinimumWeightApplied ? ` (charged for ${chargeableWeight}kg)` : '';
    toast({
      title: "Price Calculated",
      description: `Calculated price: ₹${price.toFixed(2)} for ${serviceType}${fromText} to ${location}${weightText}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading pricing information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!pricingData) {
    return (
      <div className="py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No pricing information available.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-green-600" />
            Your Pricing Plan
          </h1>
          <p className="text-gray-600 mt-1">View your assigned corporate pricing rates and calculate shipping costs</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={pricingData.status === 'approved' ? 'default' : 'secondary'}>
            {pricingData.status === 'approved' ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved
              </>
            ) : (
              pricingData.status.charAt(0).toUpperCase() + pricingData.status.slice(1)
            )}
          </Badge>
        </div>
      </div>

      {/* Price Calculator Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-purple-50 border-b border-gray-200 py-3">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-600" />
            Price Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Test Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromPincode" className="text-sm font-medium">From Pincode (Optional)</Label>
                <Input
                  id="fromPincode"
                  value={testInputs.fromPincode}
                  onChange={(e) => setTestInputs({
                    ...testInputs,
                    fromPincode: e.target.value,
                    type: e.target.value ? 'non-dox' : 'dox', // Auto-set to non-dox when from pincode is added
                    weight: '' // Reset weight when switching modes
                  })}
                  placeholder="e.g., 110001"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Leave empty for normal pricing</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinationPincode" className="text-sm font-medium">Destination Pincode</Label>
                <Input
                  id="destinationPincode"
                  value={testInputs.destinationPincode}
                  onChange={(e) => setTestInputs({
                    ...testInputs,
                    destinationPincode: e.target.value
                  })}
                  placeholder="e.g., 781001"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium">
                  Weight ({testInputs.fromPincode ? 'Kg.' : (testInputs.type === 'dox' ? 'grams' : 'Kg.')})
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step={testInputs.fromPincode ? "0.01" : (testInputs.type === 'dox' ? "0.1" : "0.01")}
                  value={testInputs.weight}
                  onChange={(e) => setTestInputs({
                    ...testInputs,
                    weight: e.target.value
                  })}
                  placeholder={testInputs.fromPincode ? "e.g., 25" : (testInputs.type === 'dox' ? "e.g., 250" : "e.g., 1.5")}
                  className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
              </div>
              {!testInputs.fromPincode && (
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">Type</Label>
                <Select
                  value={testInputs.type}
                  onValueChange={(value) => setTestInputs({
                    ...testInputs,
                    type: value,
                    weight: '' // Reset weight when type changes
                  })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dox">DOX (Documents)</SelectItem>
                    <SelectItem value="non-dox">NON-DOX (Non-Documents)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              )}
              {testInputs.fromPincode && (
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">Type</Label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                    NON-DOX (Reverse pricing only)
                  </div>
                </div>
              )}
            </div>

            {/* Service Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="byAir"
                  checked={testInputs.byAir}
                  onChange={(e) => setTestInputs({
                    ...testInputs,
                    byAir: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={testInputs.fromPincode && testInputs.type === 'non-dox'} // Disabled for reverse pricing non-dox
                />
                <Label htmlFor="byAir" className="text-sm font-medium">
                  By Air {testInputs.fromPincode && testInputs.type === 'non-dox' && '(Use Transport Mode below)'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="priority"
                  checked={testInputs.priority}
                  onChange={(e) => setTestInputs({
                    ...testInputs,
                    priority: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={testInputs.type === 'non-dox'} // Priority only for DOX
                />
                <Label htmlFor="priority" className="text-sm font-medium">
                  Priority {testInputs.type === 'non-dox' && '(DOX only)'}
                </Label>
              </div>
              {testInputs.fromPincode && testInputs.type === 'non-dox' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="transportMode" className="text-sm font-medium">Transport Mode</Label>
                    <Select
                      value={testInputs.transportMode || 'byRoad'}
                      onValueChange={(value) => setTestInputs({
                        ...testInputs,
                        transportMode: value
                      })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select transport mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="byRoad">By Road (Min. Chargeable 500kg)</SelectItem>
                        <SelectItem value="byTrain">By Train (Min. Chargeable 100kg)</SelectItem>
                        <SelectItem value="byFlight">By Flight (Min. Chargeable 25kg)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryType" className="text-sm font-medium">Delivery Type</Label>
                    <Select
                      value={testInputs.deliveryType || 'normal'}
                      onValueChange={(value) => setTestInputs({
                        ...testInputs,
                        deliveryType: value
                      })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select delivery type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal Delivery</SelectItem>
                        <SelectItem value="priority">Priority Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center">
              <Button 
                onClick={calculatePrice}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Price
              </Button>
            </div>

            {/* Results */}
            {calculatedPrice !== null && (() => {
              // Calculate chargeable weight for display
              let displayChargeableWeight = parseFloat(testInputs.weight);
              let displayIsMinimumWeightApplied = false;
              
              if (testInputs.fromPincode && testInputs.type === 'non-dox') {
                const minChargeableWeights = {
                  byRoad: 500,
                  byTrain: 100,
                  byFlight: 25
                };
                displayChargeableWeight = Math.max(parseFloat(testInputs.weight), minChargeableWeights[testInputs.transportMode as keyof typeof minChargeableWeights]);
                displayIsMinimumWeightApplied = displayChargeableWeight > parseFloat(testInputs.weight);
              }
              
              return (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Calculation Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {testInputs.fromPincode && (
                      <div>
                        <span className="font-medium">From:</span> {testInputs.fromPincode}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">To:</span> {testInputs.destinationPincode} 
                      {!testInputs.fromPincode && ` (${classifyLocation(testInputs.destinationPincode, testInputs.byAir)})`}
                      {testInputs.fromPincode && testInputs.type === 'non-dox' && (
                        isAssamPincode(testInputs.destinationPincode) ? ' (Assam)' : 
                        isNorthEastPincode(testInputs.destinationPincode) ? ' (North East)' : ''
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {testInputs.type.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Weight:</span> {testInputs.weight} {testInputs.fromPincode ? 'Kg.' : (testInputs.type === 'dox' ? 'grams' : 'Kg.')}
                      {displayIsMinimumWeightApplied && (
                        <span className="text-orange-600 ml-2">
                          (Charged for {displayChargeableWeight}kg - minimum chargeable weight)
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Service:</span> 
                      {testInputs.priority ? ' Priority' : ''}
                      {testInputs.byAir ? ' By Air' : ''}
                      {testInputs.transportMode && testInputs.fromPincode && testInputs.type === 'non-dox' ? ` ${testInputs.transportMode}` : ''}
                      {testInputs.deliveryType && testInputs.fromPincode && testInputs.type === 'non-dox' ? ` (${testInputs.deliveryType} delivery)` : ''}
                      {!testInputs.priority && !testInputs.byAir && !testInputs.transportMode ? ' Standard' : ''}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium">Calculated Price:</span> 
                      <span className="text-green-600 font-bold text-lg ml-2">₹{calculatedPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plan Info */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-green-50 border-b border-gray-200 py-3">
          <CardTitle className="text-lg font-semibold text-gray-800">{pricingData.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Plan Name:</span>
              <p className="text-gray-900">{pricingData.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <p className="text-gray-900 capitalize">{pricingData.status}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Assigned Date:</span>
              <p className="text-gray-900">
                {new Date(pricingData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          {pricingData.approvedAt && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="font-medium text-gray-700">Approved Date:</span>
              <p className="text-gray-900">
                {new Date(pricingData.approvedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Standard Service - DOX Pricing */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-blue-50 border-b border-gray-200 py-3">
          <CardTitle className="text-lg font-semibold text-gray-800">Standard Service - DOX (By Air & Surface)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white border-b border-gray-200">
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Weight</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Assam</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">NE By Surface</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">NE By Air AGT IMP</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Rest of India</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-gray-100">
                  <TableCell className="font-medium text-sm py-2">01 gm. to 250 gm.</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing['01gm-250gm'].assam)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing['01gm-250gm'].neBySurface)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing['01gm-250gm'].neByAirAgtImp)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing['01gm-250gm'].restOfIndia)}</TableCell>
                </TableRow>
                <TableRow className="border-b border-gray-100">
                  <TableCell className="font-medium text-sm py-2">251 gm. to 500 gm.</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing['251gm-500gm'].assam)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing['251gm-500gm'].neBySurface)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing['251gm-500gm'].neByAirAgtImp)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing['251gm-500gm'].restOfIndia)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-sm py-2">Add. 500 gm.</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing.add500gm.assam)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing.add500gm.neBySurface)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing.add500gm.neByAirAgtImp)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.doxPricing.add500gm.restOfIndia)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Above price is excluding of Other Charge and GST 18%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* NON DOX Surface Pricing */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-blue-50 border-b border-gray-200 py-3">
          <CardTitle className="text-lg font-semibold text-gray-800">NON DOX (By Surface) - Per Kg</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white border-b border-gray-200">
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Weight</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Assam</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">NE By Surface</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">NE By Air AGT IMP</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Rest of India</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-sm py-2">Per Kg.</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.nonDoxSurfacePricing.assam)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.nonDoxSurfacePricing.neBySurface)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.nonDoxSurfacePricing.neByAirAgtImp)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.nonDoxSurfacePricing.restOfIndia)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* NON DOX Air Pricing */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-blue-50 border-b border-gray-200 py-3">
          <CardTitle className="text-lg font-semibold text-gray-800">NON DOX (By Air) - Per Kg</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white border-b border-gray-200">
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Weight</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Assam</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">NE By Surface</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">NE By Air AGT IMP</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Rest of India</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-sm py-2">Per Kg.</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.nonDoxAirPricing.assam)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.nonDoxAirPricing.neBySurface)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.nonDoxAirPricing.neByAirAgtImp)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.nonDoxAirPricing.restOfIndia)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Priority Service - DOX Pricing */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-blue-50 border-b border-gray-200 py-3">
          <CardTitle className="text-lg font-semibold text-gray-800">Priority Service - DOX (By Air & Surface)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white border-b border-gray-200">
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Weight</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Assam</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">NE By Surface</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">NE By Air AGT IMP</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Rest of India</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-gray-100">
                  <TableCell className="font-medium text-sm py-2">01 gm. to 500 gm.</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.priorityPricing['01gm-500gm'].assam)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.priorityPricing['01gm-500gm'].neBySurface)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.priorityPricing['01gm-500gm'].neByAirAgtImp)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.priorityPricing['01gm-500gm'].restOfIndia)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-sm py-2">Every Add, 500gm.</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.priorityPricing.add500gm.assam)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.priorityPricing.add500gm.neBySurface)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.priorityPricing.add500gm.neByAirAgtImp)}</TableCell>
                  <TableCell className="text-sm py-2 text-right">{formatPrice(pricingData.priorityPricing.add500gm.restOfIndia)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Above price is excluding of Other Charge and GST 18%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reverse Pricing */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-green-50 border-b border-gray-200 py-3">
          <CardTitle className="text-lg font-semibold text-gray-800">Reverse Pricing - From Rest of India to Guwahati/Assam and North East</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white border-b border-gray-200">
                  <TableHead className="font-medium text-gray-700 text-sm py-2">Destination</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2 text-center border-l border-gray-300" colSpan={2}>
                    By Road (Min. Chargeable 500kg)
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2 text-center border-l border-gray-300" colSpan={2}>
                    By Train (Min. Chargeable 100kg)
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2 text-center border-l border-gray-300" colSpan={2}>
                    By Flight (Min. Chargeable 25kg)
                  </TableHead>
                </TableRow>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="font-medium text-gray-700 text-sm py-2"></TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2 text-center border-l border-gray-300">Normal Delivery</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2 text-center">Priority Delivery</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2 text-center border-l border-gray-300">Normal Delivery</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2 text-center">Priority Delivery</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2 text-center border-l border-gray-300">Normal Delivery</TableHead>
                  <TableHead className="font-medium text-gray-700 text-sm py-2 text-center">Priority Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-gray-100">
                  <TableCell className="font-medium text-sm py-2">To Guwahati (Assam)</TableCell>
                  <TableCell className="text-sm py-2 text-center border-l border-gray-300">{formatPrice(pricingData.reversePricing.toAssam.byRoad.normal)}</TableCell>
                  <TableCell className="text-sm py-2 text-center">{formatPrice(pricingData.reversePricing.toAssam.byRoad.priority)}</TableCell>
                  <TableCell className="text-sm py-2 text-center border-l border-gray-300">{formatPrice(pricingData.reversePricing.toAssam.byTrain.normal)}</TableCell>
                  <TableCell className="text-sm py-2 text-center">{formatPrice(pricingData.reversePricing.toAssam.byTrain.priority)}</TableCell>
                  <TableCell className="text-sm py-2 text-center border-l border-gray-300">{formatPrice(pricingData.reversePricing.toAssam.byFlight.normal)}</TableCell>
                  <TableCell className="text-sm py-2 text-center">{formatPrice(pricingData.reversePricing.toAssam.byFlight.priority)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-sm py-2">To North East (6 States)</TableCell>
                  <TableCell className="text-sm py-2 text-center border-l border-gray-300">{formatPrice(pricingData.reversePricing.toNorthEast.byRoad.normal)}</TableCell>
                  <TableCell className="text-sm py-2 text-center">{formatPrice(pricingData.reversePricing.toNorthEast.byRoad.priority)}</TableCell>
                  <TableCell className="text-sm py-2 text-center border-l border-gray-300">{formatPrice(pricingData.reversePricing.toNorthEast.byTrain.normal)}</TableCell>
                  <TableCell className="text-sm py-2 text-center">{formatPrice(pricingData.reversePricing.toNorthEast.byTrain.priority)}</TableCell>
                  <TableCell className="text-sm py-2 text-center border-l border-gray-300">{formatPrice(pricingData.reversePricing.toNorthEast.byFlight.normal)}</TableCell>
                  <TableCell className="text-sm py-2 text-center">{formatPrice(pricingData.reversePricing.toNorthEast.byFlight.priority)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Minimum Chargeable Weight:</strong> By Road - 500kg, By Train - 100kg, By Flight - 25kg
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Above price is excluding of Other Charge and GST 18%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CorporatePricingDisplay;
