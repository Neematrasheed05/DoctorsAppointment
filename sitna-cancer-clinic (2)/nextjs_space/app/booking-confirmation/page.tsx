
"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/providers/language-provider';
import { getTranslation } from '@/lib/translations';
import { CLINIC_INFO, LOCATION_SCHEDULES } from '@/lib/constants';
import { formatTimeLabel } from '@/lib/utils';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  Download,
  Share2,
  ArrowLeft
} from 'lucide-react';

interface Appointment {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  reasonForVisit: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  paymentInstructions: string;
  reminderConsent: boolean;
  status: string;
}

export default function BookingConfirmation() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id');
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    } else {
      setError('No appointment ID provided');
      setLoading(false);
    }
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      const data = await response.json();
      
      if (response.ok) {
        setAppointment(data.appointment);
      } else {
        setError(data.error || 'Failed to fetch appointment details');
      }
    } catch (err) {
      setError('Failed to fetch appointment details');
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Appointment Confirmation',
          text: `Appointment with Dr. Sitna Mwanzi at ${appointment?.location || 'Dr Sitna Mwanzi Oncology Clinic'} on ${formatDate(appointment?.appointmentDate || '')} at ${appointment?.appointmentTime ? formatTimeLabel(appointment.appointmentTime) : ''}`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getSelectedLocationDetails = () => {
    if (!appointment) return null;
    return (
      LOCATION_SCHEDULES.find((l) => l.name === appointment.location) || null
    );
  };

  const generateAppointmentSummary = () => {
    if (!appointment) return '';

    const loc = getSelectedLocationDetails();
    const locationLine = loc
      ? `Location: ${loc.fullName} (${loc.hoursLabel})\nAddress: ${loc.address}`
      : `Location: ${appointment.location}`;

    return `
APPOINTMENT CONFIRMATION
${CLINIC_INFO.name}

Patient: ${appointment.fullName}
Date: ${formatDate(appointment.appointmentDate)}
Time: ${formatTimeLabel(appointment.appointmentTime)}
Doctor: Dr. Sitna Mwanzi

${locationLine}

Reason: ${appointment.reasonForVisit}

IMPORTANT:
• Arrive 10 minutes early
• Bring your ID and medical records
• Contact: ${CLINIC_INFO.phone}

Appointment ID: ${appointment.id}
    `.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p>{language === 'en' ? 'Loading...' : 'Inapakia...'}</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2">
              {language === 'en' ? 'Error' : 'Hitilafu'}
            </h2>
            <p>{error}</p>
            <Link href="/book" className="mt-4 inline-block">
              <Button variant="outline">
                {language === 'en' ? 'Book New Appointment' : 'Weka Miadi Mpya'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        </div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getTranslation('appointmentBooked', language)}
          </h1>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Your appointment has been scheduled. Please save this confirmation for your records.' 
              : 'Miadi yako imepangwa. Tafadhali hifadhi uthibitishaji huu kwa rekodi zako.'
            }
          </p>
        </motion.div>

        {/* Appointment Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg mb-6">
            <CardHeader className="bg-pink-50">
              <CardTitle className="flex items-center text-pink-800">
                <Calendar className="w-5 h-5 mr-2" />
                {getTranslation('appointmentConfirmation', language)}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-pink-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'en' ? 'Date & Time' : 'Tarehe na Wakati'}
                      </p>
                      <p className="text-gray-600">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTimeLabel(appointment.appointmentTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-pink-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'en' ? 'Location' : 'Mahali'}
                      </p>
                      {(() => {
                        const loc = getSelectedLocationDetails();
                        if (loc) {
                          return (
                            <>
                              <p className="text-gray-600 font-medium">{loc.fullName}</p>
                              <p className="text-gray-500 text-sm">{loc.address}</p>
                              <p className="text-gray-500 text-xs mt-1">{loc.hoursLabel}</p>
                            </>
                          );
                        }
                        return <p className="text-gray-600">{appointment.location}</p>;
                      })()}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-pink-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'en' ? 'Contact' : 'Mawasiliano'}
                      </p>
                      <p className="text-gray-600">{CLINIC_INFO.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-pink-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {getTranslation('reasonForVisit', language)}
                      </p>
                      <p className="text-gray-600">{appointment.reasonForVisit}</p>
                    </div>
                  </div>

                  {appointment.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-pink-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {language === 'en' ? 'Email' : 'Barua Pepe'}
                        </p>
                        <p className="text-gray-600">{appointment.email}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-gray-900 mb-2">
                      {language === 'en' ? 'Appointment ID' : 'Kitambulisho cha Miadi'}
                    </p>
                    <p className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {appointment.id}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Clinic Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-lg mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">
                {language === 'en' ? 'Clinic Locations & Hours' : 'Mahali na Masaa ya Kliniki'}
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                {CLINIC_INFO.locations.map((loc, i) => (
                  <div key={i}>
                    <p className="font-medium text-blue-900">{loc.name}</p>
                    <p className="text-blue-800 text-sm">{loc.address}</p>
                    <p className="text-blue-700 text-xs">{loc.hours}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Important Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-lg mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">
                {language === 'en' ? 'Important Instructions' : 'Maelekezo Muhimu'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                  <p className="text-gray-600">
                    {getTranslation('arrivalInstructions', language)}
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                  <p className="text-gray-600">
                    {language === 'en' 
                      ? 'Bring a valid ID and any prior medical records related to your condition' 
                      : 'Leta kitambulisho halali na rekodi zoyote za kimatibabu zinazohusiana na hali yako'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                  <p className="text-gray-600">
                    {language === 'en' 
                      ? 'If you need to reschedule or cancel, please contact us at least 24 hours in advance' 
                      : 'Ikiwa unahitaji kupanga upya au kughairi, tafadhali wasiliana nasi angalau masaa 24 mapema'
                    }
                  </p>
                </div>
                {appointment.reminderConsent && (
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                    <p className="text-gray-600">
                      {language === 'en' 
                        ? 'You will receive appointment reminders via SMS/WhatsApp' 
                        : 'Utapokea vikumbusho vya miadi kupitia SMS/WhatsApp'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Share Confirmation' : 'Shiriki Uthibitishaji'}
          </Button>
          
          <Button
            onClick={() => {
              const summary = generateAppointmentSummary();
              const blob = new Blob([summary], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `appointment-${appointment.id}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            variant="outline"
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Download Summary' : 'Pakua Muhtasari'}
          </Button>
          
          <Link href="/reschedule">
            <Button variant="outline">
              {getTranslation('reschedule', language)} / {getTranslation('cancel', language)}
            </Button>
          </Link>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-8 p-6 bg-white rounded-lg shadow"
        >
          <h4 className="font-semibold mb-2">
            {language === 'en' ? 'Need Help?' : 'Unahitaji Msaada?'}
          </h4>
          <p className="text-gray-600 mb-4">
            {language === 'en' 
              ? 'If you have any questions or need to make changes to your appointment, please contact us:' 
              : 'Ikiwa una maswali au unahitaji kubadili miadi yako, tafadhali wasiliana nasi:'
            }
          </p>
          <div className="flex justify-center items-center space-x-2 text-pink-600">
            <Phone className="w-4 h-4" />
            <span className="font-medium">{CLINIC_INFO.phone}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
