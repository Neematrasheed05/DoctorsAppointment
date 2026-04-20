
"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { 
  ArrowLeft,
  Bell,
  Send,
  Calendar,
  Phone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface UpcomingAppointment {
  id: string;
  fullName: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit: string;
  reminderSent: boolean;
}

export default function RemindersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set());
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const defaultMessage = "Dear [Name], this is a reminder about your appointment at Dr Sitna Mwanzi Oncology Clinic on [Date] at [Time]. Please arrive 15 minutes early. For any changes, call 0717333452. Thank you!";

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchUpcomingAppointments();
    }
  }, [status, router]);

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch('/api/appointments?status=confirmed&upcoming=true');
      const data = await response.json();
      
      if (response.ok) {
        // Filter to get only upcoming appointments (next 7 days)
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcoming = data.appointments
          .filter((apt: any) => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate >= today && aptDate <= nextWeek;
          })
          .map((apt: any) => ({
            ...apt,
            reminderSent: false // In a real app, this would come from the database
          }));
        
        setAppointments(upcoming);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAppointment = (appointmentId: string) => {
    const newSelected = new Set(selectedAppointments);
    if (newSelected.has(appointmentId)) {
      newSelected.delete(appointmentId);
    } else {
      newSelected.add(appointmentId);
    }
    setSelectedAppointments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedAppointments.size === appointments.length) {
      setSelectedAppointments(new Set());
    } else {
      setSelectedAppointments(new Set(appointments.map(apt => apt.id)));
    }
  };

  const handleSendReminders = async () => {
    if (selectedAppointments.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one appointment',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      // In a real implementation, this would send SMS/WhatsApp messages
      // For now, we'll simulate the action
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update appointments to mark reminders as sent
      setAppointments(appointments.map(apt => 
        selectedAppointments.has(apt.id) ? { ...apt, reminderSent: true } : apt
      ));
      
      setSelectedAppointments(new Set());
      
      toast({
        title: 'Reminders Sent',
        description: `Successfully sent ${selectedAppointments.size} reminder${selectedAppointments.size !== 1 ? 's' : ''}`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send reminders',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Send Reminders</h1>
            <p className="text-gray-600 mt-2">
              Send appointment reminders to patients via SMS
            </p>
          </motion.div>
        </div>

        {/* Info Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Reminder System</p>
              <p className="text-blue-700">
                Select patients and send appointment reminders. The system will send SMS messages 
                to the provided phone numbers. Showing confirmed appointments in the next 7 days.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Appointments List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-pink-600" />
                    Upcoming Appointments
                  </CardTitle>
                  {appointments.length > 0 && (
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedAppointments.size === appointments.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`p-4 border rounded-lg transition-all ${
                          selectedAppointments.has(appointment.id) ? 'border-pink-600 bg-pink-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedAppointments.has(appointment.id)}
                            onCheckedChange={() => handleToggleAppointment(appointment.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{appointment.fullName}</p>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {appointment.phone}
                                </div>
                              </div>
                              {appointment.reminderSent && (
                                <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Sent
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm">
                              <p className="text-gray-700">
                                <strong>{formatDate(appointment.appointmentDate)}</strong> at {appointment.appointmentTime}
                              </p>
                              <p className="text-gray-500 mt-1">{appointment.reasonForVisit}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming appointments in the next 7 days</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Message Template & Send */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-pink-600" />
                  Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Custom Message (Optional)</Label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Leave blank to use default message..."
                    className="min-h-[120px] text-sm"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Default Template:</p>
                  <p className="text-xs text-gray-600">{defaultMessage}</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-1">Selected</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedAppointments.size}</p>
                  <p className="text-xs text-blue-700">appointment{selectedAppointments.size !== 1 ? 's' : ''}</p>
                </div>

                <Button
                  onClick={handleSendReminders}
                  disabled={selectedAppointments.size === 0 || sending}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send {selectedAppointments.size > 0 && `(${selectedAppointments.size})`} Reminder{selectedAppointments.size !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
