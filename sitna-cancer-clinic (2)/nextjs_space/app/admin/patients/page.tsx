
"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { 
  ArrowLeft,
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Filter,
  Download,
  X,
  Clock
} from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  time: string;
  service: string;
  status: string;
  symptoms?: string;
}

interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  appointments: number;
  lastVisit: string;
  appointmentsList?: Appointment[];
}

export default function PatientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchPatients();
    }
  }, [status, router]);

  useEffect(() => {
    let filtered = patients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply appointment count filter
    if (appointmentFilter !== 'all') {
      if (appointmentFilter === '0') {
        filtered = filtered.filter(patient => patient.appointments === 0);
      } else if (appointmentFilter === '1-3') {
        filtered = filtered.filter(patient => patient.appointments >= 1 && patient.appointments <= 3);
      } else if (appointmentFilter === '4+') {
        filtered = filtered.filter(patient => patient.appointments >= 4);
      }
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(patient => {
        const lastVisit = new Date(patient.lastVisit);
        
        if (dateFilter === '30days') {
          return lastVisit >= thirtyDaysAgo;
        } else if (dateFilter === '90days') {
          return lastVisit >= ninetyDaysAgo;
        } else if (dateFilter === 'older') {
          return lastVisit < ninetyDaysAgo;
        }
        return true;
      });
    }

    setFilteredPatients(filtered);
  }, [searchTerm, patients, appointmentFilter, dateFilter]);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      
      if (response.ok) {
        setPatients(data.patients);
        setFilteredPatients(data.patients);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const viewPatientDetails = async (patient: Patient) => {
    try {
      // Fetch patient appointments
      const response = await fetch(`/api/patients?id=${patient.id}`);
      const data = await response.json();
      
      if (response.ok && data.patient) {
        setSelectedPatient(data.patient);
      } else {
        setSelectedPatient(patient);
      }
    } catch (err) {
      console.error('Failed to fetch patient details:', err);
      setSelectedPatient(patient);
    }
  };

  const clearFilters = () => {
    setAppointmentFilter('all');
    setDateFilter('all');
    setSearchTerm('');
  };

  const exportPatients = () => {
    const csv = [
      ['Name', 'Phone', 'Email', 'Date of Birth', 'Total Appointments', 'Last Visit'].join(','),
      ...filteredPatients.map(p => [
        `"${p.fullName}"`,
        p.phone,
        p.email || '',
        p.dateOfBirth ? formatDate(p.dateOfBirth) : '',
        p.appointments,
        formatDate(p.lastVisit)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900">Patient Database</h1>
              <p className="text-gray-600 mt-2">
                {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} found
              </p>
            </motion.div>

            <Button onClick={exportPatients} className="bg-pink-600 hover:bg-pink-700">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-pink-50 border-pink-300' : ''}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {(appointmentFilter !== 'all' || dateFilter !== 'all') && (
                    <span className="ml-2 px-2 py-0.5 bg-pink-600 text-white text-xs rounded-full">
                      {[appointmentFilter !== 'all' ? 1 : 0, dateFilter !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </Button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-4 space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Appointment Count
                      </label>
                      <Select value={appointmentFilter} onValueChange={setAppointmentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All patients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All patients</SelectItem>
                          <SelectItem value="0">No appointments (0)</SelectItem>
                          <SelectItem value="1-3">Few appointments (1-3)</SelectItem>
                          <SelectItem value="4+">Regular patients (4+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Last Visit
                      </label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All time</SelectItem>
                          <SelectItem value="30days">Last 30 days</SelectItem>
                          <SelectItem value="90days">Last 90 days</SelectItem>
                          <SelectItem value="older">Older than 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(appointmentFilter !== 'all' || dateFilter !== 'all') && (
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearFilters}
                        className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Patients List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-pink-600" />
                All Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPatients.length > 0 ? (
                <div className="space-y-4">
                  {filteredPatients.map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 border rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all"
                    >
                      <div className="grid md:grid-cols-5 gap-4">
                        <div className="col-span-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{patient.fullName}</p>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Phone className="w-3 h-3 mr-1" />
                                {patient.phone}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          {patient.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-3 h-3 mr-1" />
                              {patient.email}
                            </div>
                          )}
                          {patient.dateOfBirth && (
                            <div className="text-sm text-gray-500 mt-1">
                              DOB: {formatDate(patient.dateOfBirth)}
                            </div>
                          )}
                        </div>

                        <div className="text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-3 h-3 mr-1" />
                            Last visit: {formatDate(patient.lastVisit)}
                          </div>
                          <div className="text-gray-500 mt-1">
                            {patient.appointments} appointment{patient.appointments !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewPatientDetails(patient)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No patients found</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-400 mt-2">
                      Try adjusting your search criteria
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Patient Details Dialog */}
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-2xl">
                <User className="w-6 h-6 mr-2 text-pink-600" />
                Patient Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedPatient && (
              <div className="space-y-6">
                {/* Patient Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <p className="text-gray-900 font-semibold">{selectedPatient.fullName}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone</label>
                        <div className="flex items-center text-gray-900">
                          <Phone className="w-4 h-4 mr-2 text-pink-600" />
                          {selectedPatient.phone}
                        </div>
                      </div>
                      
                      {selectedPatient.email && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <div className="flex items-center text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-pink-600" />
                            {selectedPatient.email}
                          </div>
                        </div>
                      )}
                      
                      {selectedPatient.dateOfBirth && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                          <div className="flex items-center text-gray-900">
                            <Calendar className="w-4 h-4 mr-2 text-pink-600" />
                            {formatDate(selectedPatient.dateOfBirth)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Appointment Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Appointment Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-pink-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Appointments</p>
                        <p className="text-2xl font-bold text-pink-600">{selectedPatient.appointments}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Last Visit</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {formatDate(selectedPatient.lastVisit)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Appointment History */}
                {selectedPatient.appointmentsList && selectedPatient.appointmentsList.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Appointment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedPatient.appointmentsList.map((appointment, index) => (
                          <div 
                            key={appointment.id}
                            className="p-4 border rounded-lg hover:border-pink-300 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-1 text-pink-600" />
                                    {formatDate(appointment.date)}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-1 text-pink-600" />
                                    {appointment.time}
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="font-semibold text-gray-900">{appointment.service}</p>
                                  {appointment.symptoms && (
                                    <p className="text-sm text-gray-600 mt-1">{appointment.symptoms}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  appointment.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : appointment.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : appointment.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
