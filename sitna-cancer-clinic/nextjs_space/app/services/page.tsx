
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { getTranslation } from "@/lib/translations";
import { CLINIC_INFO, SERVICES } from "@/lib/constants";
import { 
  ArrowLeft,
  Calendar,
  Heart, 
  Users, 
  Search, 
  Zap, 
  Shield,
  CheckCircle,
  Clock,
  Award,
  Stethoscope
} from "lucide-react";

const iconMap = {
  Search,
  Zap,
  Heart,
  Users,
  Shield,
};

const additionalServices = [
  {
    category: "Diagnostic Services",
    icon: "Search",
    services: [
      "Comprehensive cancer screening",
      "Imaging studies (CT, MRI coordination)",
      "Blood work and tumor markers",
      "Biopsy coordination",
      "Genetic testing consultation"
    ]
  },
  {
    category: "Treatment Services", 
    icon: "Zap",
    services: [
      "High-dose chemotherapy",
      "Complex chemotherapy protocols",
      "Immunotherapy administration",
      "Palliative chemotherapy",
      "Treatment monitoring"
    ]
  },
  {
    category: "Palliative Care",
    icon: "Heart", 
    services: [
      "Pain management",
      "Symptom control",
      "Family counseling and support",
      "Hospice care coordination"
    ]
  },
  {
    category: "Support Services",
    icon: "Users",
    services: [
      "Nutritional counseling",
      "Patient navigation",
      "Social work services", 
      "Chaplaincy services",
      "Support group referrals"
    ]
  }
];

export default function ServicesPage() {
  const { language } = useLanguage();

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
              {getTranslation('ourServices', language)}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Comprehensive cancer care services designed to support you through every stage of your journey with expertise, compassion, and cutting-edge treatment options.'
                : 'Huduma kamili za saratani zilizoundwa kukusaidia katika kila hatua ya safari yako kwa utaalamu, huruma, na chaguo za kisasa za matibabu.'
              }
            </p>
          </motion.div>
        </div>

        {/* Main Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {SERVICES.map((service, index) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap];
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow border-gray-200 h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-pink-600" />
                  </div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Detailed Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            {language === 'en' ? 'Detailed Services' : 'Huduma za Kina'}
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {additionalServices.map((category, index) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap];
              return (
                <Card key={index} className="shadow-lg">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="flex items-center">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                        <IconComponent className="w-5 h-5 text-pink-600" />
                      </div>
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {category.services.map((service, serviceIndex) => (
                        <li key={serviceIndex} className="flex items-start space-x-3">
                          <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5" />
                          <span className="text-gray-700">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Facility Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-pink-50">
              <CardTitle className="text-2xl text-center text-pink-800">
                {language === 'en' ? 'Our Facility' : 'Kituo Chetu'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Stethoscope className="w-5 h-5 text-pink-600 mr-2" />
                    {language === 'en' ? 'Inpatient Services' : 'Huduma za Kulalia Hospitalini'}
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                      <span>{language === 'en' ? 'Oncology ward' : 'Wodi ya saratani'}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                      <span>{language === 'en' ? 'Average stay: 15 days' : 'Kukaa kwa wastani: siku 15'}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                      <span>{language === 'en' ? 'Specialized nursing care' : 'Huduma maalum za uuguzi'}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Clock className="w-5 h-5 text-pink-600 mr-2" />
                    {language === 'en' ? 'Outpatient Services' : 'Huduma za Nje'}
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                      <span>{language === 'en' ? '3 clinics per week' : 'Kliniki 3 kwa wiki'}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                      <span>{language === 'en' ? '~20 patients per week' : '~wagonjwa 20 kwa wiki'}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                      <span>{language === 'en' ? 'Wait time < 2 days' : 'Muda wa kusubiri < siku 2'}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-pink-600" />
                      <span>{language === 'en' ? 'Walk-ins welcome' : 'Wageni bila miadi wanakaribishwa'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Specialized Care */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            {language === 'en' ? 'Specialized Care' : 'Huduma Maalum'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center shadow-lg">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">
                  {language === 'en' ? 'Adult & Pediatric' : 'Watu Wazima na Watoto'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'en' 
                    ? 'Comprehensive hematology services for both adults and children with blood disorders'
                    : 'Huduma kamili za damu kwa watu wazima na watoto wenye matatizo ya damu'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">
                  {language === 'en' ? 'Multidisciplinary' : 'Timu ya Taratibu Mbalimbali'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'en' 
                    ? 'Collaborative care with radiology, lab, surgery, and support services'
                    : 'Huduma ya ushirikiano na radioloji, maabara, upasuaji, na huduma za msaada'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">
                  {language === 'en' ? 'Compassionate Care' : 'Huduma ya Huruma'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'en' 
                    ? 'Patient-centered approach with emotional and psychological support'
                    : 'Mbinu inayolenga mgonjwa ikiwa na msaada wa kihisia na kinafsiya'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'en' 
              ? 'Ready to Start Your Journey to Better Health?' 
              : 'Uko Tayari Kuanza Safari ya Afya Bora?'
            }
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'en' 
              ? 'Our experienced team is here to provide you with comprehensive, compassionate cancer care.'
              : 'Timu yetu ya uzoefu ipo hapa kukutoa huduma kamili na ya huruma ya saratani.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/book">
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                <Calendar className="w-5 h-5 mr-2" />
                {getTranslation('bookAppointment', language)}
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg">
                {getTranslation('contactUs', language)}
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>{language === 'en' ? 'Contact us:' : 'Wasiliana nasi:'}</strong> {CLINIC_INFO.phone} | 
              <strong className="ml-2">{language === 'en' ? 'Hours:' : 'Masaa:'}</strong> {CLINIC_INFO.locations.map(l => `${l.name}: ${l.hours}`).join(' | ')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
