
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/components/providers/language-provider';
import { getTranslation } from '@/lib/translations';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Clock, 
  User,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface Patient {
  id: string;
  fullName: string;
  appointments: Array<{
    id: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    reasonForVisit: string;
  }>;
}

export default function RescheduleCancel() {
  const { language } = useLanguage();
  const [step, setStep] = useState(1); // 1: lookup, 2: select appointment, 3: action
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLookup = async () => {
    if (!fullName.trim() || !dateOfBirth) {
      setError('Please enter both full name and date of birth');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/patients/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          dateOfBirth: dateOfBirth,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.patient?.appointments?.length > 0) {
          setPatient(data.patient);
          setStep(2);
        } else {
          setError('No active appointments found for this patient');
        }
      } else {
        setError(data.error || 'Patient not found');
      }
    } catch (err) {
      setError('Failed to lookup patient information');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Appointment cancelled successfully');
        setStep(1);
        setPatient(null);
        setSelectedAppointment(null);
        setFullName('');
        setDateOfBirth('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel appointment');
      }
    } catch (err) {
      setError('Failed to cancel appointment');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Home' : 'Rudi Nyumbani'}
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getTranslation('reschedule', language)} / {getTranslation('cancel', language)}
          </h1>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Reschedule or cancel your existing appointment' 
              : 'Panga upya au ghairi miadi yako iliyopo'
            }
          </p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {success}
          </motion.div>
        )}

        {/* Step 1: Patient Lookup */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2 text-pink-600" />
                  {language === 'en' ? 'Find Your Appointment' : 'Tafuta Miadi Yako'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-gray-600">
                  {language === 'en' 
                    ? 'Please enter your details to find and manage your appointments. This information must match what you provided when booking.'
                    : 'Tafadhali ingiza maelezo yako kutafuta na kusimamia miadi yako. Taarifa hii lazima ilingane na ile uliyotoa wakati wa kuweka miadi.'
                  }
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      {getTranslation('fullName', language)} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={language === 'en' ? 'Enter your full name' : 'Andika jina lako kamili'}
                        className="pl-10"
                      />
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">
                      {getTranslation('dateOfBirth', language)} *
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleLookup}
                  disabled={loading || !fullName.trim() || !dateOfBirth}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === 'en' ? 'Searching...' : 'Inatafuta...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Search className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Find My Appointments' : 'Tafuta Miadi Yangu'}
                    </div>
                  )}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>
                    {language === 'en' ? "Don't have an appointment yet?" : 'Huna miadi bado?'}{' '}
                    <Link href="/book" className="text-pink-600 hover:text-pink-700 font-medium">
                      {getTranslation('bookAppointment', language)}
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Select Appointment */}
        {step === 2 && patient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-pink-600" />
                  {language === 'en' ? 'Your Appointments' : 'Miadi Yako'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="font-medium">
                    {language === 'en' ? 'Patient:' : 'Mgonjwa:'} {patient.fullName}
                  </p>
                </div>

                <div className="space-y-4">
                  {patient.appointments.map((appointment) => (
                    <Card 
                      key={appointment.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAppointment?.id === appointment.id ? 'ring-2 ring-teal-500' : ''
                      }`}
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-4 h-4 text-pink-600" />
                              <span className="font-medium">
                                {formatDate(appointment.appointmentDate)}
                              </span>
                              <Clock className="w-4 h-4 text-pink-600 ml-4" />
                              <span>{appointment.appointmentTime}</span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-2">
                              <strong>{language === 'en' ? 'Reason:' : 'Sababu:'}</strong> {appointment.reasonForVisit}
                            </p>
                            
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          
                          {selectedAppointment?.id === appointment.id && (
                            <CheckCircle className="w-5 h-5 text-pink-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedAppointment && (
                  <div className="flex space-x-4 pt-6 border-t">
                    <Button
                      onClick={() => {
                        // For now, just show a message about contacting the clinic
                        // In a full implementation, this would open a reschedule flow
                        alert(language === 'en' 
                          ? 'Please contact the clinic at 0717333452 to reschedule your appointment.'
                          : 'Tafadhali wasiliana na kliniki kwa 0717333452 kupanga upya miadi yako.'
                        );
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {getTranslation('reschedule', language)}
                    </Button>
                    
                    <Button
                      onClick={handleCancel}
                      disabled={loading}
                      variant="destructive"
                      className="flex-1"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {language === 'en' ? 'Cancelling...' : 'Inaghairi...'}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <X className="w-4 h-4 mr-2" />
                          {getTranslation('cancel', language)}
                        </div>
                      )}
                    </Button>
                  </div>
                )}

                <Button
                  onClick={() => {
                    setStep(1);
                    setSelectedAppointment(null);
                    setError('');
                  }}
                  variant="ghost"
                  className="w-full mt-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'en' ? 'Back to Search' : 'Rudi Kutafuta'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Information Card */}
        <Card className="mt-8 shadow-lg">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">
              {language === 'en' ? 'Important Information' : 'Taarifa Muhimu'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5" />
                {language === 'en' 
                  ? 'Please cancel or reschedule at least 24 hours before your appointment time' 
                  : 'Tafadhali ghairi au panga upya angalau masaa 24 kabla ya wakati wa miadi'
                }
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5" />
                {language === 'en' 
                  ? 'For urgent changes or same-day cancellations, please call us directly' 
                  : 'Kwa mabadiliko ya haraka au kughairi siku hiyo hiyo, tafadhali tupigie moja kwa moja'
                }
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5" />
                {language === 'en' 
                  ? 'Contact us: 0717333452 for any questions or assistance' 
                  : 'Wasiliana nasi: 0717333452 kwa maswali yoyote au msaada'
                }
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
