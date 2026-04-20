
"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Search,
  Filter,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { formatTimeLabel } from '@/lib/utils';
import { LOCATION_SCHEDULES } from '@/lib/constants';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Appointment {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  reasonForVisit: string;
  status: string;
  createdAt: string;
  patient?: {
    fullName: string;
    dateOfBirth: string;
  };
}

export default function AppointmentsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'cancel' | 'complete' | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchAppointments();
    }
  }, [status, router]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchQuery, statusFilter, locationFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments');
      const data = await response.json();
      
      if (response.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filter by location
    if (locationFilter !== 'all') {
      filtered = filtered.filter(apt => apt.location === locationFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.fullName.toLowerCase().includes(query) ||
        apt.phone.includes(query) ||
        (apt.email && apt.email.toLowerCase().includes(query))
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchAppointments();
        setShowDialog(false);
        setSelectedAppointment(null);
        setActionType(null);
      }
    } catch (err) {
      console.error('Failed to update appointment:', err);
    }
  };

  const openConfirmDialog = (appointment: Appointment, action: 'confirm' | 'cancel' | 'complete') => {
    setSelectedAppointment(appointment);
    setActionType(action);
    setShowDialog(true);
  };

  const confirmAction = () => {
    if (!selectedAppointment || !actionType) return;

    const statusMap = {
      confirm: 'CONFIRMED',
      cancel: 'CANCELLED',
      complete: 'COMPLETED'
    };

    handleStatusChange(selectedAppointment.id, statusMap[actionType]);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getActionDialogText = () => {
    if (!actionType) return { title: '', description: '' };
    
    const texts = {
      confirm: {
        title: 'Confirm Appointment',
        description: 'Are you sure you want to confirm this appointment? The patient will be notified.'
      },
      cancel: {
        title: 'Cancel Appointment',
        description: 'Are you sure you want to cancel this appointment? This action will free up the time slot.'
      },
      complete: {
        title: 'Mark as Completed',
        description: 'Mark this appointment as completed? This indicates the patient visit has concluded.'
      }
    };

    return texts[actionType];
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const dialogText = getActionDialogText();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Appointments Management</h1>
                <p className="text-sm text-gray-600">Dr Sitna Mwanzi Oncology Clinic</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={fetchAppointments}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {LOCATION_SCHEDULES.map((loc) => (
                      <SelectItem key={loc.id} value={loc.name}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredAppointments.length} of {appointments.length} appointments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No appointments found</p>
                  <p className="text-sm">Try adjusting your filters or search query</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="mt-1">
                          {getStatusIcon(appointment.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.fullName}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{formatDate(appointment.appointmentDate)} at {formatTimeLabel(appointment.appointmentTime)}</span>
                              </div>
                              <div className="flex items-start">
                                <MapPin className="w-4 h-4 mr-2 text-pink-500 mt-0.5 flex-shrink-0" />
                                <span className="font-medium text-gray-800">{appointment.location || 'PMC Building'}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{appointment.phone}</span>
                              </div>
                              {appointment.email && (
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                  <span>{appointment.email}</span>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Reason for Visit</p>
                              <p className="text-sm text-gray-700">{appointment.reasonForVisit}</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t">
                            {appointment.status === 'PENDING' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => openConfirmDialog(appointment, 'confirm')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => openConfirmDialog(appointment, 'cancel')}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            
                            {appointment.status === 'CONFIRMED' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => openConfirmDialog(appointment, 'complete')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Mark Complete
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => openConfirmDialog(appointment, 'cancel')}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}

                            {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') && (
                              <span className="text-sm text-gray-500 py-2">
                                No actions available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogText.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogText.description}
              {selectedAppointment && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedAppointment.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedAppointment.appointmentDate)} at {formatTimeLabel(selectedAppointment.appointmentTime)}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1 text-pink-500" />
                    {selectedAppointment.location || 'PMC Building'}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
