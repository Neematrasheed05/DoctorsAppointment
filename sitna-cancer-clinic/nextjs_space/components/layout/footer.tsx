
"use client";

import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { getTranslation } from '@/lib/translations';
import { CLINIC_INFO } from '@/lib/constants';
import { Phone, MapPin, Clock } from 'lucide-react';

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Clinic Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SM</span>
              </div>
              <div>
                <div className="font-bold text-lg">{CLINIC_INFO.name}</div>
                <div className="text-sm text-gray-400">{CLINIC_INFO.specialty}</div>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              {language === 'en' 
                ? 'Comprehensive cancer care with compassionate treatment and expert medical professionals.' 
                : 'Huduma kamili ya saratani kwa matibabu ya huruma na wataalamu wa kimatibabu.'
              }
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-4">
              {getTranslation('contactUs', language)}
            </h3>
            <div className="space-y-3 text-sm">
              {CLINIC_INFO.locations.map((loc, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-pink-400 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium">{loc.name}</div>
                    <div className="text-gray-300">{loc.address}</div>
                    <div className="text-gray-400 text-xs flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1" />
                      {loc.hours}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-pink-400" />
                <span>{CLINIC_INFO.phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">
              {language === 'en' ? 'Quick Links' : 'Viungo vya Haraka'}
            </h3>
            <div className="space-y-2 text-sm">
              <Link href="/book" className="block text-gray-300 hover:text-pink-400 transition-colors">
                {getTranslation('bookAppointment', language)}
              </Link>
              <Link href="/reschedule" className="block text-gray-300 hover:text-pink-400 transition-colors">
                {getTranslation('reschedule', language)} / {getTranslation('cancel', language)}
              </Link>
              <Link href="/services" className="block text-gray-300 hover:text-pink-400 transition-colors">
                {getTranslation('ourServices', language)}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-4 text-center text-sm text-gray-400">
          <p>© 2024 {CLINIC_INFO.name}. {language === 'en' ? 'All rights reserved.' : 'Haki zote zimehifadhiwa.'}</p>
        </div>
      </div>
    </footer>
  );
}
