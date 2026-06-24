'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileCheck,
  ShieldCheck,
  Building,
  Users,
  Award,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Upload,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Types
interface PlayerRegistration {
  id: string;
  playerName: string;
  playerId: string;
  registrationNumber: string;
  federation: string;
  status: 'Active' | 'Pending' | 'Expired' | 'Suspended';
  registrationDate: string;
  expiryDate: string;
  documents: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffCertification {
  id: string;
  staffName: string;
  staffId: string;
  certificationType: string;
  licenseNumber: string;
  issuingBody: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Pending';
  issueDate: string;
  expiryDate: string;
  cpdPoints: number;
  documents: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FacilityAudit {
  id: string;
  facilityName: string;
  facilityType: string;
  auditDate: string;
  auditor: string;
  status: 'Passed' | 'Failed' | 'Pending' | 'Under Review';
  score: number;
  findings: string[];
  correctiveActions: string[];
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface StaffCredential {
  id: string;
  staffName: string;
  staffId: string;
  credentialType: string;
  licenseNumber: string;
  issuingAuthority: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Pending';
  issueDate: string;
  expiryDate: string;
  level: string;
  specialization?: string;
  documents: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Stats Card Component
function StatsCard({ title, value, subtitle, icon, trend }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value} {trend.isPositive ? '↑' : '↓'} from last season
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'Active': 'default',
    'Valid': 'default',
    'Passed': 'default',
    'Pending': 'secondary',
    'Expiring Soon': 'secondary',
    'Under Review': 'secondary',
    'Expired': 'destructive',
    'Suspended': 'destructive',
    'Failed': 'destructive',
  };

  const icons: Record<string, React.ReactNode> = {
    'Active': <CheckCircle className="h-3 w-3 mr-1" />,
    'Valid': <CheckCircle className="h-3 w-3 mr-1" />,
    'Passed': <CheckCircle className="h-3 w-3 mr-1" />,
    'Pending': <Clock className="h-3 w-3 mr-1" />,
    'Expiring Soon': <AlertTriangle className="h-3 w-3 mr-1" />,
    'Under Review': <Clock className="h-3 w-3 mr-1" />,
    'Expired': <XCircle className="h-3 w-3 mr-1" />,
    'Suspended': <XCircle className="h-3 w-3 mr-1" />,
    'Failed': <XCircle className="h-3 w-3 mr-1" />,
  };

  return (
    <Badge variant={variants[status] || 'outline'} className="flex items-center">
      {icons[status]}
      {status}
    </Badge>
  );
}

// Main Component
export function ComplianceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('registrations');
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [registrations, setRegistrations] = useState<PlayerRegistration[]>([]);
  const [staffCertifications, setStaffCertifications] = useState<StaffCertification[]>([]);
  const [facilityAudits, setFacilityAudits] = useState<FacilityAudit[]>([]);
  const [staffCredentials, setStaffCredentials] = useState<StaffCredential[]>([]);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for adding/editing
  const [formData, setFormData] = useState<any>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchRegistrations(),
        fetchStaffCertifications(),
        fetchFacilityAudits(),
        fetchStaffCredentials(),
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      toast.error('Failed to fetch data', {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/compliance?type=registrations');
      if (!response.ok) throw new Error('Failed to fetch registrations');
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      throw error;
    }
  };

  // Fetch staff certifications
  const fetchStaffCertifications = async () => {
    try {
      const response = await fetch('/api/compliance?type=certifications');
      if (!response.ok) throw new Error('Failed to fetch certifications');
      const data = await response.json();
      if (data.success) {
        setStaffCertifications(data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching certifications:', error);
      throw error;
    }
  };

  // Fetch facility audits
  const fetchFacilityAudits = async () => {
    try {
      const response = await fetch('/api/compliance?type=audits');
      if (!response.ok) throw new Error('Failed to fetch audits');
      const data = await response.json();
      if (data.success) {
        setFacilityAudits(data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching audits:', error);
      throw error;
    }
  };

  // Fetch staff credentials
  const fetchStaffCredentials = async () => {
    try {
      const response = await fetch('/api/compliance?type=credentials');
      if (!response.ok) throw new Error('Failed to fetch credentials');
      const data = await response.json();
      if (data.success) {
        setStaffCredentials(data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching credentials:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      playerName: '',
      playerId: '',
      registrationNumber: '',
      federation: '',
      status: 'Pending',
      registrationDate: '',
      expiryDate: '',
      notes: '',
      // For certifications
      staffName: '',
      staffId: '',
      certificationType: '',
      licenseNumber: '',
      issuingBody: '',
      cpdPoints: 0,
      // For audits
      facilityName: '',
      facilityType: '',
      auditDate: '',
      auditor: '',
      score: 0,
      findings: '',
      correctiveActions: '',
      followUpDate: '',
      // For credentials
      credentialType: '',
      issuingAuthority: '',
      level: '',
      specialization: '',
    });
    setUploadedFile(null);
  };

  // Handle Add
  const handleAdd = async () => {
    setIsSubmitting(true);
    try {
      let endpoint = '';
      let payload = {};

      switch (activeTab) {
        case 'registrations':
          endpoint = '/api/compliance';
          payload = {
            type: 'registration',
            ...formData,
          };
          break;
        case 'certifications':
          endpoint = '/api/compliance';
          payload = {
            type: 'certification',
            ...formData,
          };
          break;
        case 'audits':
          endpoint = '/api/compliance';
          payload = {
            type: 'audit',
            ...formData,
            findings: formData.findings ? formData.findings.split(',').map((s: string) => s.trim()) : [],
            correctiveActions: formData.correctiveActions ? formData.correctiveActions.split(',').map((s: string) => s.trim()) : [],
          };
          break;
        case 'credentials':
          endpoint = '/api/compliance';
          payload = {
            type: 'credential',
            ...formData,
          };
          break;
        default:
          throw new Error('Invalid tab');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add item');

      toast.success('Item added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      fetchAllData();
    } catch (error: any) {
      toast.error('Failed to add item', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit
  const handleEdit = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      let endpoint = `/api/compliance?id=${selectedItem.id}`;
      let payload = {};

      switch (activeTab) {
        case 'registrations':
          payload = {
            type: 'registration',
            ...formData,
          };
          break;
        case 'certifications':
          payload = {
            type: 'certification',
            ...formData,
          };
          break;
        case 'audits':
          payload = {
            type: 'audit',
            ...formData,
            findings: formData.findings ? formData.findings.split(',').map((s: string) => s.trim()) : [],
            correctiveActions: formData.correctiveActions ? formData.correctiveActions.split(',').map((s: string) => s.trim()) : [],
          };
          break;
        case 'credentials':
          payload = {
            type: 'credential',
            ...formData,
          };
          break;
        default:
          throw new Error('Invalid tab');
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update item');

      toast.success('Item updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      fetchAllData();
    } catch (error: any) {
      toast.error('Failed to update item', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      let endpoint = `/api/compliance?id=${selectedItem.id}`;
      let type = '';

      switch (activeTab) {
        case 'registrations':
          type = 'registration';
          break;
        case 'certifications':
          type = 'certification';
          break;
        case 'audits':
          type = 'audit';
          break;
        case 'credentials':
          type = 'credential';
          break;
        default:
          throw new Error('Invalid tab');
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete item');

      toast.success('Item deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchAllData();
    } catch (error: any) {
      toast.error('Failed to delete item', {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success('File uploaded', {
        description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      });
    }
  };

  // Calculate stats
  const totalRegistrations = registrations.length;
  const activeRegistrations = registrations.filter(r => r.status === 'Active').length;
  const registrationRate = totalRegistrations > 0 ? Math.round((activeRegistrations / totalRegistrations) * 100) : 0;

  const totalCertifications = staffCertifications.length;
  const validCertifications = staffCertifications.filter(c => c.status === 'Valid').length;
  const certificationRate = totalCertifications > 0 ? Math.round((validCertifications / totalCertifications) * 100) : 0;

  const totalAudits = facilityAudits.length;
  const passedAudits = facilityAudits.filter(a => a.status === 'Passed').length;
  const auditScore = totalAudits > 0 ? Math.round((passedAudits / totalAudits) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive">Error Loading Data</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={fetchAllData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Player Registration Rate"
          value={`${registrationRate}%`}
          subtitle={`${activeRegistrations} / ${totalRegistrations} players registered`}
          icon={<FileCheck className="h-5 w-5 text-primary" />}
          trend={{ value: '+2%', isPositive: true }}
        />
        <StatsCard
          title="Certified Staff"
          value={`${certificationRate}%`}
          subtitle={`${validCertifications} / ${totalCertifications} staff certified`}
          icon={<ShieldCheck className="h-5 w-5 text-primary" />}
          trend={{ value: '+5%', isPositive: true }}
        />
        <StatsCard
          title="Safety Score"
          value={`Grade ${auditScore >= 90 ? 'A' : auditScore >= 70 ? 'B' : 'C'}`}
          subtitle={`${passedAudits}/${totalAudits} audits passed`}
          icon={<Building className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="registrations" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Player Registrations
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Staff Certifications
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Facility Audits
          </TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff Credentials
          </TabsTrigger>
        </TabsList>

        {/* Player Registrations Tab */}
        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Player Registrations</CardTitle>
                  <CardDescription>
                    Manage official player registrations with football federations.
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Register Player
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search registrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={fetchAllData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Registration #</TableHead>
                      <TableHead>Federation</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.filter(item => 
                      item.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.playerName}</TableCell>
                        <TableCell>{item.registrationNumber}</TableCell>
                        <TableCell>{item.federation}</TableCell>
                        <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                        <TableCell><StatusBadge status={item.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedItem(item);
                                setFormData(item);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {registrations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No registrations found. Click "Register Player" to add one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Certifications Tab */}
        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Staff Certifications</CardTitle>
                  <CardDescription>
                    Ensure all coaches and staff hold valid certifications.
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Certificate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search certifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={fetchAllData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>License #</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffCertifications.filter(item =>
                      item.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.certificationType.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.staffName}</TableCell>
                        <TableCell>{item.certificationType}</TableCell>
                        <TableCell>{item.licenseNumber}</TableCell>
                        <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                        <TableCell><StatusBadge status={item.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setSelectedItem(item);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              setSelectedItem(item);
                              setFormData(item);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                              setSelectedItem(item);
                              setIsDeleteDialogOpen(true);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {staffCertifications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No certifications found. Click "Upload Certificate" to add one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facility Audits Tab */}
        <TabsContent value="audits">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Facility Audits</CardTitle>
                  <CardDescription>
                    Log and manage safety audits for all academy facilities.
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Audit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={fetchAllData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Facility</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Audit Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facilityAudits.filter(item =>
                      item.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.facilityType.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.facilityName}</TableCell>
                        <TableCell>{item.facilityType}</TableCell>
                        <TableCell>{new Date(item.auditDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={item.score} className="w-16" />
                            <span className="font-medium">{item.score}%</span>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={item.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setSelectedItem(item);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              setSelectedItem(item);
                              setFormData(item);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                              setSelectedItem(item);
                              setIsDeleteDialogOpen(true);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {facilityAudits.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No audits found. Click "New Audit" to add one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Credentials Tab */}
        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Staff Credentials</CardTitle>
                  <CardDescription>
                    Mandatory coaching and safety certifications.
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Credential
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search credentials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={fetchAllData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Credential Type</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>License #</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffCredentials.filter(item =>
                      item.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.credentialType.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.staffName}</TableCell>
                        <TableCell>{item.credentialType}</TableCell>
                        <TableCell>{item.level}</TableCell>
                        <TableCell>{item.licenseNumber}</TableCell>
                        <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                        <TableCell><StatusBadge status={item.status} /></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setSelectedItem(item);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              setSelectedItem(item);
                              setFormData(item);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                              setSelectedItem(item);
                              setIsDeleteDialogOpen(true);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {staffCredentials.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No credentials found. Click "Add Credential" to add one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'registrations' ? 'Register Player' :
               activeTab === 'certifications' ? 'Upload Certificate' :
               activeTab === 'audits' ? 'New Audit' : 'Add Credential'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Registration Form */}
            {activeTab === 'registrations' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Player Name *</Label>
                    <Input
                      value={formData.playerName || ''}
                      onChange={(e) => setFormData({...formData, playerName: e.target.value})}
                      placeholder="Enter player name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Player ID *</Label>
                    <Input
                      value={formData.playerId || ''}
                      onChange={(e) => setFormData({...formData, playerId: e.target.value})}
                      placeholder="Enter player ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Registration Number *</Label>
                    <Input
                      value={formData.registrationNumber || ''}
                      onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                      placeholder="e.g., FKF-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Federation *</Label>
                    <Select
                      value={formData.federation || ''}
                      onValueChange={(value) => setFormData({...formData, federation: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select federation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FKF">FKF</SelectItem>
                        <SelectItem value="CAF">CAF</SelectItem>
                        <SelectItem value="FIFA">FIFA</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Registration Date *</Label>
                    <Input
                      type="date"
                      value={formData.registrationDate || ''}
                      onChange={(e) => setFormData({...formData, registrationDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={formData.expiryDate || ''}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status || 'Pending'}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Certification Form */}
            {activeTab === 'certifications' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Staff Name *</Label>
                    <Input
                      value={formData.staffName || ''}
                      onChange={(e) => setFormData({...formData, staffName: e.target.value})}
                      placeholder="Enter staff name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Staff ID *</Label>
                    <Input
                      value={formData.staffId || ''}
                      onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                      placeholder="Enter staff ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Certification Type *</Label>
                    <Input
                      value={formData.certificationType || ''}
                      onChange={(e) => setFormData({...formData, certificationType: e.target.value})}
                      placeholder="e.g., CAF B License"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>License Number *</Label>
                    <Input
                      value={formData.licenseNumber || ''}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      placeholder="Enter license number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issuing Body *</Label>
                    <Input
                      value={formData.issuingBody || ''}
                      onChange={(e) => setFormData({...formData, issuingBody: e.target.value})}
                      placeholder="e.g., CAF, Red Cross"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPD Points</Label>
                    <Input
                      type="number"
                      value={formData.cpdPoints || 0}
                      onChange={(e) => setFormData({...formData, cpdPoints: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issue Date *</Label>
                    <Input
                      type="date"
                      value={formData.issueDate || ''}
                      onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={formData.expiryDate || ''}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status || 'Pending'}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Upload Certificate</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={handleFileUpload}
                  />
                  {uploadedFile && (
                    <p className="text-sm text-green-600">Uploaded: {uploadedFile.name}</p>
                  )}
                </div>
              </>
            )}

            {/* Audit Form */}
            {activeTab === 'audits' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Facility Name *</Label>
                    <Input
                      value={formData.facilityName || ''}
                      onChange={(e) => setFormData({...formData, facilityName: e.target.value})}
                      placeholder="Enter facility name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Facility Type *</Label>
                    <Select
                      value={formData.facilityType || ''}
                      onValueChange={(value) => setFormData({...formData, facilityType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stadium">Stadium</SelectItem>
                        <SelectItem value="Training Pitch">Training Pitch</SelectItem>
                        <SelectItem value="Gym">Gym</SelectItem>
                        <SelectItem value="Classroom">Classroom</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Audit Date *</Label>
                    <Input
                      type="date"
                      value={formData.auditDate || ''}
                      onChange={(e) => setFormData({...formData, auditDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Auditor *</Label>
                    <Input
                      value={formData.auditor || ''}
                      onChange={(e) => setFormData({...formData, auditor: e.target.value})}
                      placeholder="Enter auditor name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Score (%) *</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.score || 0}
                      onChange={(e) => setFormData({...formData, score: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select
                      value={formData.status || 'Pending'}
                      onValueChange={(value) => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Passed">Passed</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Findings (comma separated)</Label>
                  <Textarea
                    value={formData.findings || ''}
                    onChange={(e) => setFormData({...formData, findings: e.target.value})}
                    placeholder="Enter findings separated by commas"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Corrective Actions (comma separated)</Label>
                  <Textarea
                    value={formData.correctiveActions || ''}
                    onChange={(e) => setFormData({...formData, correctiveActions: e.target.value})}
                    placeholder="Enter corrective actions separated by commas"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Date</Label>
                  <Input
                    type="date"
                    value={formData.followUpDate || ''}
                    onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                  />
                </div>
              </>
            )}

            {/* Credential Form */}
            {activeTab === 'credentials' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Staff Name *</Label>
                    <Input
                      value={formData.staffName || ''}
                      onChange={(e) => setFormData({...formData, staffName: e.target.value})}
                      placeholder="Enter staff name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Staff ID *</Label>
                    <Input
                      value={formData.staffId || ''}
                      onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                      placeholder="Enter staff ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Credential Type *</Label>
                    <Input
                      value={formData.credentialType || ''}
                      onChange={(e) => setFormData({...formData, credentialType: e.target.value})}
                      placeholder="e.g., CAF License, First Aid"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>License Number *</Label>
                    <Input
                      value={formData.licenseNumber || ''}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      placeholder="Enter license number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issuing Authority *</Label>
                    <Input
                      value={formData.issuingAuthority || ''}
                      onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                      placeholder="e.g., CAF, Ministry of Sports"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Level *</Label>
                    <Select
                      value={formData.level || ''}
                      onValueChange={(value) => setFormData({...formData, level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Level 1">Level 1</SelectItem>
                        <SelectItem value="Level 2">Level 2</SelectItem>
                        <SelectItem value="Level 3">Level 3</SelectItem>
                        <SelectItem value="Level 4">Level 4</SelectItem>
                        <SelectItem value="Level 5">Level 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input
                    value={formData.specialization || ''}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="e.g., Technical Development, Goalkeeping"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issue Date *</Label>
                    <Input
                      type="date"
                      value={formData.issueDate || ''}
                      onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={formData.expiryDate || ''}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status || 'Pending'}
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Item'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
            <DialogDescription>
              Complete information about this item.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedItem).map(([key, value]) => {
                  if (typeof value === 'object' || value === null) return null;
                  return (
                    <div key={key}>
                      <Label className="text-muted-foreground text-xs uppercase">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <p className="font-medium break-words">{String(value)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Same form fields as Add Dialog but with pre-filled values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.playerName || formData.staffName || formData.facilityName || ''}
                  onChange={(e) => {
                    const field = activeTab === 'registrations' ? 'playerName' :
                                 activeTab === 'certifications' ? 'staffName' :
                                 activeTab === 'audits' ? 'facilityName' : 'staffName';
                    setFormData({...formData, [field]: e.target.value});
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === 'registrations' && (
                      <>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </>
                    )}
                    {activeTab === 'certifications' && (
                      <>
                        <SelectItem value="Valid">Valid</SelectItem>
                        <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </>
                    )}
                    {activeTab === 'audits' && (
                      <>
                        <SelectItem value="Passed">Passed</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                      </>
                    )}
                    {activeTab === 'credentials' && (
                      <>
                        <SelectItem value="Valid">Valid</SelectItem>
                        <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}