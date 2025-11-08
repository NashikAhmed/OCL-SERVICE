import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Package, MapPin, RefreshCw, Scan, PlusCircle, Layers, ShoppingBag, ChevronRight, ChevronDown } from 'lucide-react';

interface AddressFormData {
  _id: string;
  consignmentNumber?: number;
  originData?: { city: string; state: string };
  destinationData?: { city: string; state: string };
  senderCity?: string;
  senderState?: string;
  receiverCity?: string;
  receiverState?: string;
  shipmentData?: { actualWeight?: number };
  assignmentData?: {
    status?: 'booked' | 'assigned' | 'partially_assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'received';
  };
}

type RouteKey = string; // e.g., "Guwahati, Assam → Imphal, Manipur"

interface Bag {
  id: string; // routeKey + index
  routeKey: RouteKey;
  consignments: string[]; // consignment numbers in this bag (keep as string to preserve leading zeros)
  createdAt: string;
}

const getLocationString = (form: AddressFormData, isOrigin: boolean) => {
  if (isOrigin) {
    if (form.originData) return `${form.originData.city}, ${form.originData.state}`;
    return `${form.senderCity || 'N/A'}, ${form.senderState || 'N/A'}`;
  }
  if (form.destinationData) return `${form.destinationData.city}, ${form.destinationData.state}`;
  return `${form.receiverCity || 'N/A'}, ${form.receiverState || 'N/A'}`;
};

const makeRouteKey = (form: AddressFormData): RouteKey => {
  return `${getLocationString(form, true)} → ${getLocationString(form, false)}`;
};

const BaggingManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [receivedOrders, setReceivedOrders] = useState<AddressFormData[]>([]);
  const [activeRoute, setActiveRoute] = useState<RouteKey | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [bagsByRoute, setBagsByRoute] = useState<Record<RouteKey, Bag[]>>({});
  const [expandedBags, setExpandedBags] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const [scanTimer, setScanTimer] = useState<number | null>(null);
  const [showPathMismatchPopup, setShowPathMismatchPopup] = useState(false);
  const [showManifest, setShowManifest] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Determine expected barcode length by mode of lengths in received consignments, fallback to 9
  const expectedLength = useMemo(() => {
    const lengths: Record<number, number> = {};
    for (const o of receivedOrders) {
      const len = o.consignmentNumber?.toString().length;
      if (!len) continue;
      lengths[len] = (lengths[len] || 0) + 1;
    }
    const entries = Object.entries(lengths);
    if (entries.length === 0) return 9;
    entries.sort((a, b) => b[1] - a[1]);
    return parseInt(entries[0][0], 10);
  }, [receivedOrders]);

  // Fetch received consignments
  const fetchReceivedOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/addressforms?status=received', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch received consignments');
      const result = await response.json();
      const data: AddressFormData[] = result.data || [];
      setReceivedOrders(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to load received consignments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedOrders();
  }, []);

  // Group by route
  const ordersByRoute = useMemo(() => {
    const groups: Record<RouteKey, AddressFormData[]> = {};
    for (const order of receivedOrders) {
      const key = makeRouteKey(order);
      if (!groups[key]) groups[key] = [];
      groups[key].push(order);
    }
    return groups;
  }, [receivedOrders]);

  // Ensure at least one bag exists per active route
  const ensureBagForRoute = (route: RouteKey) => {
    setBagsByRoute(prev => {
      const copy = { ...prev };
      if (!copy[route] || copy[route].length === 0) {
        copy[route] = [{ id: `${route}#1`, routeKey: route, consignments: [], createdAt: new Date().toISOString() }];
      }
      return copy;
    });
  };

  // Handle scanning input with small debounce to capture full scan burst
  const handleBarcodeInputChange = (value: string) => {
    setBarcodeInput(value);
    if (scanTimer) {
      window.clearTimeout(scanTimer);
    }
    const timer = window.setTimeout(() => {
      if (value.trim().length >= expectedLength) {
        handleScan(value.trim());
      }
    }, 150);
    setScanTimer(timer as unknown as number);
  };

  const handleScan = (consignmentNumberStr: string) => {
    if (!activeRoute) {
      toast({ title: 'Select a route', description: 'Choose a route before scanning', variant: 'destructive' });
      setBarcodeInput('');
      return;
    }

    // Check if consignment exists anywhere in received consignments
    const orderInReceived = receivedOrders.find(o => o.consignmentNumber?.toString() === consignmentNumberStr);
    if (orderInReceived) {
      const scannedRoute = makeRouteKey(orderInReceived);
      if (scannedRoute !== activeRoute) {
        // Show 2-second popup: path doesn't match
        setShowPathMismatchPopup(true);
        setTimeout(() => setShowPathMismatchPopup(false), 2000);
        setBarcodeInput('');
        return;
      }
    }

    // Find in received consignments for the active route (ensures both received + route match)
    const matchingOrder = (ordersByRoute[activeRoute] || []).find(o => o.consignmentNumber?.toString() === consignmentNumberStr);

    if (!matchingOrder) {
      toast({ title: 'Not found', description: 'Consignment not in received list for this route' });
      setBarcodeInput('');
      return;
    }

    // Prevent adding to multiple bags: check across all bags for this route
    const alreadyBagged = (bagsByRoute[activeRoute] || []).some(b => b.consignments.includes(consignmentNumberStr));
    if (alreadyBagged) {
      toast({ title: 'Already bagged', description: `Consignment ${consignmentNumberStr} is already in a bag` });
      setBarcodeInput('');
      return;
    }

    // Put into the latest bag for the route
    let shouldOpenManifest = false;
    setBagsByRoute(prev => {
      const routeBags = prev[activeRoute] ? [...prev[activeRoute]] : [];
      if (routeBags.length === 0) {
        routeBags.push({ id: `${activeRoute}#1`, routeKey: activeRoute, consignments: [], createdAt: new Date().toISOString() });
      }
      const lastBag = routeBags[routeBags.length - 1];
      if (!lastBag.consignments.includes(consignmentNumberStr)) {
        lastBag.consignments = [...lastBag.consignments, consignmentNumberStr];
      }
      const totalOrdersForRoute = (ordersByRoute[activeRoute] || []).length;
      const totalBaggedForRoute = routeBags.reduce((sum, b) => sum + b.consignments.length, 0);
      if (totalOrdersForRoute > 0 && totalBaggedForRoute === totalOrdersForRoute) {
        shouldOpenManifest = true;
      }
      return { ...prev, [activeRoute]: routeBags };
    });

    setBarcodeInput('');
    toast({ title: 'Added to bag', description: `Consignment ${consignmentNumberStr} added` });
    if (shouldOpenManifest) setShowManifest(true);
  };

  const startNextBag = () => {
    if (!activeRoute) return;
    setBagsByRoute(prev => {
      const routeBags = prev[activeRoute] ? [...prev[activeRoute]] : [];
      const nextIndex = routeBags.length + 1;
      routeBags.push({ id: `${activeRoute}#${nextIndex}`, routeKey: activeRoute, consignments: [], createdAt: new Date().toISOString() });
      return { ...prev, [activeRoute]: routeBags };
    });
  };

  const routeKeys = Object.keys(ordersByRoute);

  useEffect(() => {
    if (activeRoute) ensureBagForRoute(activeRoute);
  }, [activeRoute]);

  // Helper: get a Set of already bagged consignments for the active route
  const baggedSetForActiveRoute = useMemo(() => {
    if (!activeRoute) return new Set<string>();
    const routeBags = bagsByRoute[activeRoute] || [];
    const set = new Set<string>();
    for (const b of routeBags) {
      for (const cn of b.consignments) set.add(cn);
    }
    return set;
  }, [activeRoute, bagsByRoute]);

  // Build and download an Excel manifest for the active route
  const downloadManifest = () => {
    if (!activeRoute) {
      toast({ title: 'Select a route', description: 'Choose a route to export manifest', variant: 'destructive' });
      return;
    }

    const routeBags = bagsByRoute[activeRoute] || [];
    if (routeBags.length === 0) {
      toast({ title: 'No bags', description: 'Create a bag before exporting manifest', variant: 'destructive' });
      return;
    }

    // Quick lookup by consignment number
    const consignmentToOrder: Record<string, AddressFormData> = {};
    for (const order of ordersByRoute[activeRoute] || []) {
      const key = order.consignmentNumber?.toString();
      if (key) consignmentToOrder[key] = order;
    }

    // Header row
    const rows: Array<Record<string, string | number>> = [];

    rows.push({
      'Consignment No': 'Consignment No',
      'Weight (kg)': 'Weight (kg)',
      'Route': 'Route',
    });

    // Data rows
    routeBags.forEach((bag) => {
      bag.consignments.forEach((cn) => {
        const order = consignmentToOrder[cn];
        const weight = order?.shipmentData?.actualWeight ?? '';
        rows.push({
          'Consignment No': cn,
          'Weight (kg)': weight,
          'Route': activeRoute,
        });
      });
    });

    // Totals row
    const totalWeight = rows
      .map(r => r['Weight (kg)'])
      .reduce((sum, w) => sum + (typeof w === 'number' ? w : 0), 0);
    rows.push({ 'Consignment No': '', 'Weight (kg)': '', 'Route': '' });
    rows.push({ 'Consignment No': 'Total Weight (kg)', 'Weight (kg)': totalWeight, 'Route': '' });

    // Create worksheet/workbook
    const worksheet = XLSX.utils.json_to_sheet(rows, { skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Manifest');

    // File name with route and timestamp
    const safeRoute = activeRoute.replace(/[^a-zA-Z0-9\- ]/g, '_');
    const filename = `manifest_${safeRoute}_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, filename);

    toast({ title: 'Manifest Downloaded', description: `Saved ${filename}` });
  };

  // Prepare manifest rows for on-screen view
  const getManifestRows = () => {
    if (!activeRoute) return [] as Array<{ consignment: string; weight: string | number; route: string }>;
    const routeBags = bagsByRoute[activeRoute] || [];
    const consignmentToOrder: Record<string, AddressFormData> = {};
    for (const order of ordersByRoute[activeRoute] || []) {
      const key = order.consignmentNumber?.toString();
      if (key) consignmentToOrder[key] = order;
    }
    const rows: Array<{ consignment: string; weight: string | number; route: string }> = [];
    routeBags.forEach((bag) => {
      bag.consignments.forEach((cn) => {
        const order = consignmentToOrder[cn];
        const weight = order?.shipmentData?.actualWeight ?? '';
        rows.push({ consignment: cn, weight, route: activeRoute });
      });
    });
    return rows;
  };

  const manifestRows = useMemo(() => getManifestRows(), [activeRoute, bagsByRoute, ordersByRoute]);

  const handleSendManifestEmail = async () => {
    if (!emailInput || !activeRoute) return;
    try {
      setSendingEmail(true);
      const adminToken = localStorage.getItem('adminToken');
      const sentAt = new Date().toISOString();
      const payload = {
        email: emailInput,
        route: activeRoute,
        sentAt,
        rows: manifestRows.map(r => ({ consignment: r.consignment, weight: r.weight, units: 1 }))
      };
      const resp = await fetch('/api/admin/send-manifest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error(await resp.text());
      toast({ title: 'Email sent', description: `Manifest sent to ${emailInput}` });
      setShowManifest(false);
      setEmailInput('');
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to send', description: 'Could not send manifest email', variant: 'destructive' });
    } finally {
      setSendingEmail(false);
    }
  };

  // Total weight for active route (sum numeric weights)
  const totalWeight = useMemo(() => {
    if (!activeRoute) return 0;
    return manifestRows.reduce((sum, r) => sum + (typeof r.weight === 'number' ? r.weight : 0), 0);
  }, [activeRoute, manifestRows]);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold" style={{ fontFamily: 'Calibr', fontSize: '32px' }}>
                Bagging
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'Calibri' }}>
                Group received consignments by route and scan consignments into bags
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Route groups */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Routes ({routeKeys.length})</h3>
              <Button onClick={fetchReceivedOrders} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {routeKeys.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Received Consignments</h3>
                <p className="text-gray-600">No consignments with status received.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {routeKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveRoute(key)}
                    className={`text-left rounded-lg border p-4 transition hover:shadow-sm ${
                      activeRoute === key ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-800">{key}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                      <Layers className="h-3 w-3" />
                      {ordersByRoute[key].length} orders
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active route details: scanner + orders list */}
          {activeRoute && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <h3 className="text-lg font-semibold">{activeRoute}</h3>
                  <Badge variant="secondary">{ordersByRoute[activeRoute]?.length || 0} orders</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-72">
                    <Input
                      type="text"
                      placeholder="Scan consignment barcode"
                      value={barcodeInput}
                      onChange={(e) => handleBarcodeInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && barcodeInput.trim()) {
                          handleScan(barcodeInput.trim());
                        }
                      }}
                      className="text-center text-lg border-2 border-blue-300 focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                <Button size="sm" variant="outline" onClick={() => setShowManifest(true)}>
                  View Manifest
                </Button>
                  <Button size="sm" onClick={() => startNextBag()} className="bg-blue-600 text-white hover:bg-blue-700">
                    <PlusCircle className="h-4 w-4 mr-1" /> Next Bag
                  </Button>
                </div>
              </div>

              {/* Two-column layout: Bags (left) | Orders (right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bags for this route - left */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Bags</h4>
                  {(bagsByRoute[activeRoute] || []).map((bag, idx) => {
                    const isExpanded = expandedBags[bag.id];
                    return (
                      <div key={bag.id} className="rounded-md border p-3 bg-blue-50/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-blue-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="font-semibold text-gray-800">Bag {idx + 1}</span>
                            <Badge variant="secondary">{bag.consignments.length} consignments</Badge>
                          </div>
                          <div className="text-xs text-gray-500">{new Date(bag.createdAt).toLocaleString()}</div>
                        </div>
                        <button
                          className="w-full text-left mt-2 text-sm text-blue-700 hover:underline"
                          onClick={() => setExpandedBags(prev => ({ ...prev, [bag.id]: !prev[bag.id] }))}
                        >
                          {isExpanded ? 'Hide consignments' : 'Show consignments'}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {bag.consignments.length === 0 ? (
                              <div className="col-span-2 text-gray-500">No consignments yet. Scan to add.</div>
                            ) : (
                              bag.consignments.map(cn => (
                                <div key={cn} className="rounded border bg-white px-3 py-2 text-sm">
                                  CN: {cn}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Orders for this route (hide already bagged) - right */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Orders</h4>
                  {(ordersByRoute[activeRoute] || [])
                    .filter(o => !baggedSetForActiveRoute.has(o.consignmentNumber?.toString() || ''))
                    .map(order => (
                      <div key={order._id} className="flex items-center justify-between rounded-md border p-3 bg-white">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-blue-600">{order.consignmentNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span>{makeRouteKey(order)}</span>
                          </div>
                        </div>
                        <div>
                          <Badge variant="outline">received</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Path mismatch popup */}
          {showPathMismatchPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm mx-4">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Path doesn't match</h3>
                  <p className="text-gray-600">Scanned consignment route differs from the selected route.</p>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      <Dialog open={showManifest} onOpenChange={setShowManifest}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-3">
                <img src="/assets/ocl-logo.jpg" alt="Company" className="h-8 w-8 rounded-sm object-contain" />
                <div>
                  <div className="text-base font-semibold">OUR Courier & Logistics</div>
                  <div className="text-sm text-muted-foreground">Manifest</div>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div><span className="text-gray-500">Route:</span> <span className="font-medium">{activeRoute || ''}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date().toLocaleString()}</span></div>
                <div><span className="text-gray-500">Total Consignments:</span> <span className="font-medium">{manifestRows.length}</span></div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 rounded-md border border-gray-300 overflow-hidden">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Consignment No</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Weight (kg)</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Route</th>
                </tr>
              </thead>
              <tbody>
                {manifestRows.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2 text-sm align-top">{row.consignment}</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm align-top">{row.weight}</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm align-top">{row.route}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold">Total</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm font-semibold">{totalWeight}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                type="email"
                placeholder="Recipient email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button onClick={handleSendManifestEmail} disabled={!emailInput || sendingEmail}>
                {sendingEmail ? 'Sending…' : 'Send Email'}
              </Button>
            </div>
            <Button variant="outline" onClick={() => setShowManifest(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BaggingManagement;


