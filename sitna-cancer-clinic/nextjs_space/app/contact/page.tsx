
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/components/providers/language-provider';
import { getTranslation } from '@/lib/translations';
import { CLINIC_INFO, FAQ, WORKING_HOURS } from '@/lib/constants';
import { 
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Mail,
  MessageCircle,
  User,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ContactPage() {
  const { language } = useLanguage();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(language === 'en' 
          ? 'Your message has been sent successfully! We will get back to you soon.'
          : 'Ujumbe wako umetumwa kwa mafanikio! Tutakujibu hivi karibuni.'
        );
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Home' : 'Rudi Nyumbani'}
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {getTranslation('contactUs', language)}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Get in touch with our team. We are here to help and answer any questions you may have.'
                : 'Wasiliana na timu yetu. Tuko hapa kusaidia na kujibu maswali yoyote unayoweza kuwa nayo.'
              }
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {language === 'en' ? 'Get In Touch' : 'Wasiliana Nasi'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {language === 'en' ? 'Phone' : 'Simu'}
                    </h3>
                    <p className="text-gray-600">{CLINIC_INFO.phone}</p>
                    <p className="text-sm text-gray-500">
                      {language === 'en' ? 'Available during clinic hours' : 'Inapatikana wakati wa masaa ya kliniki'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {language === 'en' ? 'Locations' : 'Mahali'}
                    </h3>
                    {CLINIC_INFO.locations.map((loc, i) => (
                      <div key={i} className="mb-2">
                        <p className="text-gray-700 font-medium">{loc.name}</p>
                        <p className="text-gray-600 text-sm">{loc.address}</p>
                        <p className="text-gray-500 text-xs">{loc.hours}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {language === 'en' ? 'Opening Hours' : 'Masaa ya Ufunguzi'}
                    </h3>
                    <div className="space-y-1 text-sm">
                      {WORKING_HOURS.map((day) => (
                        <div key={day.day} className="flex justify-between">
                          <span className={day.open ? 'text-gray-600' : 'text-gray-400'}>
                            {day.day}
                          </span>
                          <span className={day.open ? 'text-gray-600' : 'text-red-500'}>
                            {day.hours}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-800 mb-2">
                    {language === 'en' ? 'Emergency Notice' : 'Notisi ya Dharura'}
                  </h4>
                  <p className="text-pink-700 text-sm">
                    {language === 'en' 
                      ? 'For life-threatening emergencies, please call emergency services immediately. This form is not monitored 24/7.'
                      : 'Kwa dharura zinazohayarisha maisha, tafadhali pigia huduma za dharura mara moja. Fomu hii haiangaliwa masaa 24/7.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-pink-600" />
                  {language === 'en' ? 'Send Message' : 'Tuma Ujumbe'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {success && (
                  <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {success}
                  </div>
                )}

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        {getTranslation('fullName', language)} *
                      </Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder={language === 'en' ? 'Your full name' : 'Jina lako kamili'}
                          className="pl-10"
                          required
                        />
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

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
                          required
                        />
                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
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

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      {language === 'en' ? 'Subject' : 'Mada'} *
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder={language === 'en' ? 'What is this about?' : 'Hii ni kuhusu nini?'}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {language === 'en' ? 'Message' : 'Ujumbe'} *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder={language === 'en' 
                        ? 'Please describe your question or concern in detail...' 
                        : 'Tafadhali eleza swali lako au wasiwasi wako kwa undani...'
                      }
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {language === 'en' ? 'Sending...' : 'Inatuma...'}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Send Message' : 'Tuma Ujumbe'}
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {language === 'en' ? 'Frequently Asked Questions' : 'Maswali Yanayoulizwa Mara kwa Mara'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {FAQ.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold text-gray-900">{faq.question}</h4>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'en' 
              ? 'Ready to Schedule Your Appointment?' 
              : 'Uko Tayari Kupanga Miadi Yako?'
            }
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'en' 
              ? "Don't wait - book your consultation with Doctor Sitna Mwanzi today and take the first step towards better health."
              : 'Usisubiri - weka miadi ya ushauri na Daktari Sitna Mwanzi leo na uchukue hatua ya kwanza kuelekea afya bora.'
            }
          </p>
          <Link href="/book">
            <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
              {getTranslation('bookAppointment', language)}
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
