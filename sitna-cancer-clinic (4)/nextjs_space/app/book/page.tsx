
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmergencyAlert } from '@/components/ui/emergency-alert';
import { useLanguage } from '@/components/providers/language-provider';
import { getTranslation } from '@/lib/translations';
import { LOCATION_SCHEDULES } from '@/lib/constants';
import { formatPhoneNumber, formatTimeLabel, isValidEmail, isValidPhone, getNextBusinessDays } from '@/lib/utils';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Ban,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BookingFormData {
  fullName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  reasonForVisit: string;
  selectedDate: string;
  selectedLocation: string; // Location display name (e.g. "PMC Building")
  selectedTime: string;
  reminderConsent: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface LocationSlots {
  id: string;
  name: string;
  fullName: string;
  address: string;
  hoursLabel: string;
  timeRangeLabel: string;
  slots: TimeSlot[];
}

interface UnavailabilityEntry {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}

export default function BookAppointment() {
  const { language } = useLanguage();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    reasonForVisit: '',
    selectedDate: '',
    selectedLocation: '',
    selectedTime: '',
    reminderConsent: false,
  });
  
  const [availableDates] = useState(getNextBusinessDays(14));
  const [locationSlots, setLocationSlots] = useState<LocationSlots[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unavailableDates, setUnavailableDates] = useState<UnavailabilityEntry[]>([]);
  const [unavailableMessage, setUnavailableMessage] = useState('');

  useEffect(() => {
    fetchUnavailableDates();
  }, []);

  const fetchUnavailableDates = async () => {
    try {
      const response = await fetch('/api/unavailability');
      const data = await response.json();
      if (response.ok && data.unavailability) {
        setUnavailableDates(data.unavailability);
      }
    } catch (err) {
      console.error('Failed to fetch unavailable dates:', err);
    }
  };

  const isDateUnavailable = (date: Date): UnavailabilityEntry | null => {
    const dateStr = date.toISOString().split('T')[0];
    for (const entry of unavailableDates) {
      const start = new Date(entry.startDate).toISOString().split('T')[0];
      const end = new Date(entry.endDate).toISOString().split('T')[0];
      if (dateStr >= start && dateStr <= end) {
        return entry;
      }
    }
    return null;
  };

  const fetchAvailableSlots = async (date: string) => {
    if (!date) return;

    setLoading(true);
    setUnavailableMessage('');
    try {
      const response = await fetch(`/api/availability?date=${date}`);
      const data = await response.json();

      if (response.ok) {
        const locs: LocationSlots[] = data.locations || [];
        setLocationSlots(locs);
        if (data.isUnavailable) {
          setUnavailableMessage(data.message || '');
        }
        // If only one location is open for the day, auto-select it.
        if (locs.length === 1) {
          setFormData((prev) => ({
            ...prev,
            selectedLocation: locs[0].name,
            selectedTime: '',
          }));
        }
      } else {
        setError(data.error || 'Failed to fetch available slots');
      }
    } catch (err) {
      setError('Failed to fetch available slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.selectedDate) {
      fetchAvailableSlots(formData.selectedDate);
    }
  }, [formData.selectedDate]);

  const handleInputChange = (field: keyof BookingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!isValidPhone(formData.phone)) {
      setError('Please enter a valid Kenyan phone number');
      return false;
    }
    if (formData.email && !isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.reasonForVisit.trim()) {
      setError('Reason for visit is required');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.selectedDate) {
      setError(language === 'en' ? 'Please select a date' : 'Tafadhali chagua tarehe');
      return false;
    }
    if (!formData.selectedLocation) {
      setError(language === 'en' ? 'Please select a clinic location' : 'Tafadhali chagua eneo la kliniki');
      return false;
    }
    if (!formData.selectedTime) {
      setError(language === 'en' ? 'Please select a time slot' : 'Tafadhali chagua nafasi ya wakati');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return;

    setLoading(true);
    try {
      const appointmentData = {
        fullName: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth,
        phone: formatPhoneNumber(formData.phone),
        email: formData.email.trim() || null,
        reasonForVisit: formData.reasonForVisit.trim(),
        appointmentDate: formData.selectedDate,
        appointmentTime: formData.selectedTime,
        location: formData.selectedLocation,
        reminderConsent: formData.reminderConsent,
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to confirmation page
        router.push(`/booking-confirmation?id=${data.appointment.id}`);
      } else {
        setError(data.error || 'Failed to book appointment');
      }
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
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
            {getTranslation('bookAppointment', language)}
          </h1>
          <p className="text-gray-600">
            {language === 'en' 
              ? 'Schedule your consultation with Dr. Sitna' 
              : 'Panga ushauri wako na Dkt. Sitna'
            }
          </p>
        </div>

        <EmergencyAlert />

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step 
                    ? 'bg-pink-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-pink-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>{language === 'en' ? 'Personal Info' : 'Taarifa za Kibinafsi'}</span>
            <span>{language === 'en' ? 'Select Time' : 'Chagua Wakati'}</span>
            <span>{language === 'en' ? 'Confirmation' : 'Uthibitishaji'}</span>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              {currentStep === 1 && <User className="w-5 h-5 mr-2 text-pink-600" />}
              {currentStep === 2 && <Calendar className="w-5 h-5 mr-2 text-pink-600" />}
              {currentStep === 3 && <CheckCircle className="w-5 h-5 mr-2 text-pink-600" />}
              
              {currentStep === 1 && (language === 'en' ? 'Personal Information' : 'Taarifa za Kibinafsi')}
              {currentStep === 2 && (language === 'en' ? 'Select Date & Time' : 'Chagua Tarehe na Wakati')}
              {currentStep === 3 && (language === 'en' ? 'Review & Confirm' : 'Kagua na Thibitisha')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      {getTranslation('fullName', language)} *
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder={language === 'en' ? 'Enter your full name' : 'Andika jina lako kamili'}
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">
                      {getTranslation('dateOfBirth', language)} *
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {getTranslation('phoneNumber', language)} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0712345678"
                        className="pl-10"
                      />
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {getTranslation('email', language)}
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className="pl-10"
                      />
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonForVisit">
                    {getTranslation('reasonForVisit', language)} *
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="reasonForVisit"
                      value={formData.reasonForVisit}
                      onChange={(e) => handleInputChange('reasonForVisit', e.target.value)}
                      placeholder={language === 'en' 
                        ? 'Please describe your reason for the visit' 
                        : 'Tafadhali eleza sababu ya kutembelea'
                      }
                      className="min-h-[100px] pl-10 pt-3"
                    />
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Date & Time Selection */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Unavailable dates notice */}
                {unavailableDates.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">
                        {language === 'en' 
                          ? 'Some dates are unavailable'
                          : 'Tarehe zingine hazipatikani'}
                      </p>
                      <p className="text-red-600 text-xs mt-1">
                        {language === 'en'
                          ? 'Dates marked in red are blocked because Dr. Sitna is unavailable.'
                          : 'Tarehe zilizo na rangi nyekundu zimefungwa kwa sababu Dkt. Sitna hapatikani.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Clinic schedule reference */}
                <div className="bg-pink-50 border border-pink-100 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-pink-900">
                    {language === 'en' ? 'Clinic Schedule' : 'Ratiba ya Kliniki'}
                  </p>
                  {LOCATION_SCHEDULES.map((loc) => (
                    <div key={loc.id} className="flex items-start text-xs text-pink-800">
                      <MapPin className="w-3.5 h-3.5 mr-1 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{loc.fullName}:</strong> {loc.hoursLabel}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>{getTranslation('preferredDate', language)} *</Label>
                  <Select 
                    value={formData.selectedDate} 
                    onValueChange={(value) => {
                      const dateObj = new Date(value);
                      const blocked = isDateUnavailable(dateObj);
                      if (blocked) {
                        setUnavailableMessage(
                          blocked.reason 
                            ? (language === 'en' 
                                ? `Dr. Sitna is unavailable: ${blocked.reason}` 
                                : `Dkt. Sitna hapatikani: ${blocked.reason}`)
                            : (language === 'en'
                                ? 'Dr. Sitna is unavailable on this date'
                                : 'Dkt. Sitna hapatikani tarehe hii')
                        );
                        setLocationSlots([]);
                      } else {
                        setUnavailableMessage('');
                      }
                      setFormData((prev) => ({
                        ...prev,
                        selectedDate: value,
                        selectedLocation: '',
                        selectedTime: '',
                      }));
                      setError('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select a date' : 'Chagua tarehe'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.map((date) => {
                        const blocked = isDateUnavailable(date);
                        return (
                          <SelectItem 
                            key={date.toISOString()} 
                            value={date.toISOString().split('T')[0]}
                            disabled={!!blocked}
                            className={blocked ? 'text-red-400 line-through opacity-60' : ''}
                          >
                            {formatDate(date)}
                            {blocked && (blocked.reason ? ` — ${blocked.reason}` : (language === 'en' ? ' — Unavailable' : ' — Hapatikani'))}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {formData.selectedDate && unavailableMessage && (
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start">
                    <Ban className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">{unavailableMessage}</p>
                      <p className="text-sm text-red-600 mt-1">
                        {language === 'en'
                          ? 'Please select a different date for your appointment.'
                          : 'Tafadhali chagua tarehe nyingine kwa miadi yako.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location picker — only shows when a date is selected and there are open locations */}
                {formData.selectedDate && !unavailableMessage && locationSlots.length > 0 && (
                  <div className="space-y-2">
                    <Label>
                      {language === 'en' ? 'Clinic Location' : 'Eneo la Kliniki'} *
                    </Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {locationSlots.map((loc) => {
                        const active = formData.selectedLocation === loc.name;
                        return (
                          <button
                            type="button"
                            key={loc.id}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                selectedLocation: loc.name,
                                selectedTime: '',
                              }));
                              setError('');
                            }}
                            className={`text-left p-4 rounded-lg border-2 transition-all ${
                              active
                                ? 'border-pink-600 bg-pink-50 shadow-sm'
                                : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                            }`}
                          >
                            <div className="flex items-start">
                              <MapPin className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${active ? 'text-pink-600' : 'text-gray-500'}`} />
                              <div className="flex-1">
                                <p className={`font-medium ${active ? 'text-pink-900' : 'text-gray-900'}`}>
                                  {loc.fullName}
                                </p>
                                <p className={`text-xs mt-1 ${active ? 'text-pink-700' : 'text-gray-600'}`}>
                                  <Clock className="inline w-3 h-3 mr-1" />
                                  {loc.timeRangeLabel}
                                </p>
                                <p className="text-xs mt-1 text-gray-500">
                                  {loc.slots.length}{' '}
                                  {language === 'en'
                                    ? loc.slots.length === 1
                                      ? 'slot available'
                                      : 'slots available'
                                    : loc.slots.length === 1
                                    ? 'nafasi moja inapatikana'
                                    : 'nafasi zinapatikana'}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formData.selectedDate && !unavailableMessage && formData.selectedLocation && (
                  <div className="space-y-2">
                    <Label>{getTranslation('preferredTime', language)} *</Label>
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
                      </div>
                    ) : (() => {
                      const currentLoc = locationSlots.find((l) => l.name === formData.selectedLocation);
                      const slots = currentLoc?.slots || [];
                      return slots.length > 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                          {slots.map((slot) => (
                            <Button
                              key={slot.time}
                              variant={formData.selectedTime === slot.time ? "default" : "outline"}
                              onClick={() => handleInputChange('selectedTime', slot.time)}
                              disabled={!slot.available}
                              className="flex items-center justify-center"
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTimeLabel(slot.time)}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center py-4">
                          {language === 'en' 
                            ? 'No available slots for this location on this date' 
                            : 'Hakuna nafasi za wakati kwa eneo hili tarehe hii'
                          }
                        </p>
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Review & Confirmation */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">
                    {language === 'en' ? 'Appointment Summary' : 'Muhtasari wa Miadi'}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>{getTranslation('fullName', language)}:</strong> {formData.fullName}
                    </div>
                    <div>
                      <strong>{language === 'en' ? 'Date' : 'Tarehe'}:</strong> {
                        formData.selectedDate ? formatDate(new Date(formData.selectedDate)) : ''
                      }
                    </div>
                    <div>
                      <strong>{language === 'en' ? 'Time' : 'Wakati'}:</strong> {formData.selectedTime ? formatTimeLabel(formData.selectedTime) : ''}
                    </div>
                    <div>
                      <strong>{language === 'en' ? 'Location' : 'Eneo'}:</strong> {formData.selectedLocation}
                    </div>
                    <div>
                      <strong>{getTranslation('phoneNumber', language)}:</strong> {formData.phone}
                    </div>
                    {formData.email && (
                      <div>
                        <strong>{language === 'en' ? 'Email' : 'Barua pepe'}:</strong> {formData.email}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <strong>{getTranslation('reasonForVisit', language)}:</strong>
                    <p className="mt-1">{formData.reasonForVisit}</p>
                  </div>
                </div>

                {/* Selected location highlight */}
                {(() => {
                  const loc = LOCATION_SCHEDULES.find((l) => l.name === formData.selectedLocation);
                  if (!loc) return null;
                  return (
                    <div className="bg-pink-50 p-6 rounded-lg border border-pink-100">
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-pink-900">
                            {language === 'en' ? 'Your Clinic Location' : 'Eneo Lako la Kliniki'}
                          </h4>
                          <p className="text-sm text-pink-800 mt-1">{loc.address}</p>
                          <p className="text-xs text-pink-700 mt-1">
                            {language === 'en' ? 'Opening hours: ' : 'Masaa ya kufunguliwa: '}{loc.hoursLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reminderConsent}
                      onChange={(e) => handleInputChange('reminderConsent', e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-600">
                      {language === 'en' 
                        ? 'I consent to receive appointment reminders via SMS/WhatsApp' 
                        : 'Nakubali kupokea vikumbusho vya miadi kupitia SMS/WhatsApp'
                      }
                    </span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Back' : 'Rudi Nyuma'}
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  {language === 'en' ? 'Next' : 'Ongoza'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === 'en' ? 'Booking...' : 'Inaweka...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {getTranslation('confirm', language)}
                    </div>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clinic Info */}
        <Card className="mt-8 shadow-lg">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">
              {language === 'en' ? 'Important Information' : 'Taarifa Muhimu'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5" />
                {getTranslation('arrivalInstructions', language)}
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5" />
                {language === 'en' 
                  ? 'Appointment duration: 45 minutes' 
                  : 'Muda wa miadi: dakika 45'
                }
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-pink-600 mr-2 mt-0.5" />
                {language === 'en' 
                  ? 'Telehealth consultations are also available' 
                  : 'Mashauriano ya telemedicine yanapatikana pia'
                }
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
