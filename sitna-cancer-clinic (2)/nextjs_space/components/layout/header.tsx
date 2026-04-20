
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/providers/language-provider';
import { getTranslation } from '@/lib/translations';
import { CLINIC_INFO } from '@/lib/constants';
import { Phone, MapPin, Calendar, Globe } from 'lucide-react';

export function Header() {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image 
                  src="/cancer-logo.png" 
                  alt="Dr Sitna Mwanzi Oncology Clinic Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg text-gray-900">{CLINIC_INFO.name}</div>
                <div className="text-xs text-gray-600">{CLINIC_INFO.specialty}</div>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
            >
              {getTranslation('welcome', language).split(' ').slice(-3).join(' ')}
            </Link>
            <Link 
              href="/services" 
              className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
            >
              {getTranslation('ourServices', language)}
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
            >
              {getTranslation('contactUs', language)}
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              className="text-xs"
            >
              <Globe className="w-3 h-3 mr-1" />
              {language === 'en' ? 'SW' : 'EN'}
            </Button>
            <Link href="/book">
              <Button className="bg-pink-600 hover:bg-pink-700">
                <Calendar className="w-4 h-4 mr-2" />
                {getTranslation('bookAppointment', language)}
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick contact info */}
        <div className="hidden sm:flex items-center justify-center py-2 text-xs text-gray-600 space-x-6 border-t">
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3" />
            <span>{CLINIC_INFO.phone}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>PMC Rm 608 | KNH Doctors Plaza Rm 26</span>
          </div>
          <div className="text-pink-600 font-medium">
            {getTranslation('operatingHours', language)}
          </div>
        </div>
      </div>
    </header>
  );
}
