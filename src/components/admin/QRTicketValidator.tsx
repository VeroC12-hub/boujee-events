import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Camera, 
  Check, 
  X, 
  User, 
  Calendar, 
  MapPin, 
  Clock,
  Ticket,
  Users,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TicketValidationResult {
  valid: boolean;
  ticket?: {
    id: string;
    ticketNumber: string;
    status: 'valid' | 'used' | 'cancelled';
    usedAt?: string;
  };
  event?: {
    id: string;
    title: string;
    date: string;
    location: string;
    venue: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

interface EventCapacity {
  capacity: number;
  booked: number;
  checkedIn: number;
  available: number;
}

export const QRTicketValidator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scanner');
  const [scannerActive, setScannerActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validationResult, setValidationResult] = useState<TicketValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [eventCapacity, setEventCapacity] = useState<EventCapacity | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Simulated QR code scanner (in real implementation, use a QR code library like qr-scanner)
  useEffect(() => {
    if (scannerActive && videoRef.current) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [scannerActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: 'Unable to access camera. Please ensure camera permissions are granted.'
      });
      setScannerActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const validateTicket = async (qrData: string) => {
    if (!qrData.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please provide QR code data'
      });
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      // Simulate API call to validate ticket
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation result
      const isValid = Math.random() > 0.3; // 70% valid rate for demo
      
      if (isValid) {
        const mockResult: TicketValidationResult = {
          valid: true,
          ticket: {
            id: 'ticket_123',
            ticketNumber: 'EVT-001-AB12',
            status: 'valid'
          },
          event: {
            id: 'event_001',
            title: 'Luxury Wine Tasting Experience',
            date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            location: 'Napa Valley, CA',
            venue: 'Château Margaux'
          },
          user: {
            id: 'user_123',
            name: 'John Smith',
            email: 'john.smith@example.com'
          }
        };
        setValidationResult(mockResult);
        
        // Mock event capacity
        setEventCapacity({
          capacity: 50,
          booked: 47,
          checkedIn: 23,
          available: 3
        });

        toast({
          title: 'Valid Ticket',
          description: 'Ticket validated successfully!'
        });
      } else {
        const errorMessages = [
          'Ticket has already been used',
          'Invalid QR code format',
          'Ticket not found',
          'Event has been cancelled'
        ];
        const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        
        setValidationResult({
          valid: false,
          error: randomError
        });

        toast({
          variant: 'destructive',
          title: 'Invalid Ticket',
          description: randomError
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        valid: false,
        error: 'Validation service temporarily unavailable'
      });
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to validate ticket'
      });
    } finally {
      setValidating(false);
    }
  };

  const checkInTicket = async () => {
    if (!validationResult || !validationResult.valid) return;

    try {
      // Simulate check-in API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setValidationResult({
        ...validationResult,
        ticket: {
          ...validationResult.ticket!,
          status: 'used',
          usedAt: new Date().toISOString()
        }
      });

      if (eventCapacity) {
        setEventCapacity({
          ...eventCapacity,
          checkedIn: eventCapacity.checkedIn + 1
        });
      }

      toast({
        title: 'Check-in Successful',
        description: 'Attendee has been checked in to the event'
      });
    } catch (error) {
      console.error('Check-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Check-in Failed',
        description: 'Failed to check in attendee'
      });
    }
  };

  const clearResults = () => {
    setValidationResult(null);
    setEventCapacity(null);
    setManualCode('');
  };

  // Simulated QR detection (in real implementation, use a proper QR scanner library)
  const detectQRCode = () => {
    // Mock QR code detection
    const mockQRCodes = [
      '{"ticketId":"ticket_123","eventId":"event_001","userId":"user_123","ticketNumber":"EVT-001-AB12","issuedAt":"2025-01-01T00:00:00Z","checksum":"abc123"}',
      'invalid-qr-data',
      '{"ticketId":"ticket_used","status":"used"}',
    ];
    
    const randomQR = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
    validateTicket(randomQR);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <QrCode className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Ticket Validator</h1>
          <p className="text-gray-600">Scan or manually validate event tickets</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
              <CardDescription>
                Use the camera to scan ticket QR codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ display: scannerActive ? 'block' : 'none' }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ display: 'none' }}
                  />
                  
                  {!scannerActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Camera is off</p>
                        <p className="text-sm opacity-75">Click start to begin scanning</p>
                      </div>
                    </div>
                  )}
                  
                  {scannerActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-yellow-400 rounded-lg" style={{ width: '200px', height: '200px' }}>
                        <div className="w-full h-full border-2 border-dashed border-yellow-400 rounded-lg opacity-50"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => setScannerActive(!scannerActive)}
                    className={scannerActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
                  </Button>
                  
                  {scannerActive && (
                    <Button
                      onClick={detectQRCode}
                      variant="outline"
                      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Simulate Scan
                    </Button>
                  )}
                  
                  <Button
                    onClick={clearResults}
                    variant="ghost"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual QR Code Entry</CardTitle>
              <CardDescription>
                Manually enter or paste QR code data for validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="manual-qr" className="text-sm font-medium">
                    QR Code Data
                  </label>
                  <Input
                    id="manual-qr"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Paste QR code data here..."
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    onClick={() => validateTicket(manualCode)}
                    disabled={!manualCode.trim() || validating}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    {validating ? 'Validating...' : 'Validate Ticket'}
                  </Button>
                  
                  <Button
                    onClick={clearResults}
                    variant="ghost"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Results */}
      {validationResult && (
        <Card className={validationResult.valid ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {validationResult.valid ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              <span>
                {validationResult.valid ? 'Valid Ticket' : 'Invalid Ticket'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResult.valid && validationResult.ticket && validationResult.event && validationResult.user ? (
              <div className="space-y-6">
                {/* Ticket Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Ticket className="h-5 w-5 mr-2 text-blue-500" />
                      Ticket Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ticket Number:</span>
                        <span className="font-mono">{validationResult.ticket.ticketNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={validationResult.ticket.status === 'valid' ? 'default' : 'secondary'}>
                          {validationResult.ticket.status}
                        </Badge>
                      </div>
                      {validationResult.ticket.usedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Used At:</span>
                          <span>{new Date(validationResult.ticket.usedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-purple-500" />
                      Attendee Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span>{validationResult.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{validationResult.user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Information */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg flex items-center mb-4">
                    <Calendar className="h-5 w-5 mr-2 text-green-500" />
                    Event Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <p className="font-medium">{validationResult.event.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(validationResult.event.date).toLocaleDateString()} at{' '}
                            {new Date(validationResult.event.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <p className="font-medium">{validationResult.event.venue}</p>
                          <p className="text-sm text-gray-600">{validationResult.event.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {validationResult.ticket.status === 'valid' && (
                  <div className="border-t pt-4">
                    <Button
                      onClick={checkInTicket}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      size="lg"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Check In Attendee
                    </Button>
                  </div>
                )}

                {validationResult.ticket.status === 'used' && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      This ticket has already been used for check-in.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validationResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Capacity Dashboard */}
      {eventCapacity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Event Capacity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{eventCapacity.capacity}</div>
                <div className="text-sm text-gray-600">Total Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{eventCapacity.booked}</div>
                <div className="text-sm text-gray-600">Tickets Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{eventCapacity.checkedIn}</div>
                <div className="text-sm text-gray-600">Checked In</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{eventCapacity.available}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Check-in Progress</span>
                <span>{eventCapacity.checkedIn} / {eventCapacity.booked}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(eventCapacity.checkedIn / eventCapacity.booked) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRTicketValidator;