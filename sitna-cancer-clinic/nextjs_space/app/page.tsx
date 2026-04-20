"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmergencyAlert } from "@/components/ui/emergency-alert";
import { useLanguage } from "@/components/providers/language-provider";
import { getTranslation } from "@/lib/translations";
import { CLINIC_INFO, SERVICES, FAQ } from "@/lib/constants";
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Clock, 
  Heart, 
  Users, 
  Search, 
  Zap, 
  Shield,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";

const iconMap = {
  Search,
  Zap,
  Heart,
  Users,
  Shield,
};

export default function Home() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 to-blue-50 py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <EmergencyAlert />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {getTranslation('welcome', language)}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Comprehensive and compassionate cancer screening, diagnosis, treatment and supportive care in Nairobi.'
                : 'Uchunguzi, utambuzi, matibabu na huduma ya msaada ya saratani kwa huruma na uangalifu huko Nairobi.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/book">
                <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-lg px-8 py-6">
                  <Calendar className="w-5 h-5 mr-2" />
                  {getTranslation('bookAppointment', language)}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Quick Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <Card className="text-center border-pink-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <MapPin className="w-8 h-8 text-pink-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{language === 'en' ? 'Locations' : 'Mahali'}</h3>
                {CLINIC_INFO.locations.map((loc, i) => (
                  <p key={i} className="text-sm text-gray-600 mb-1">{loc.address}</p>
                ))}
              </CardContent>
            </Card>

            <Card className="text-center border-pink-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <Clock className="w-8 h-8 text-pink-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{language === 'en' ? 'Hours' : 'Masaa'}</h3>
                {CLINIC_INFO.locations.map((loc, i) => (
                  <div key={i} className="text-sm text-gray-600 mb-2">
                    <p className="font-medium text-gray-700">{loc.name}</p>
                    <p>{loc.hours}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="text-center border-pink-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <Phone className="w-8 h-8 text-pink-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{language === 'en' ? 'Contact' : 'Mawasiliano'}</h3>
                <p className="text-sm text-gray-600">{CLINIC_INFO.phone}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {getTranslation('aboutClinic', language)}
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              {language === 'en' 
                ? 'Dr Sitna Mwanzi Oncology Clinic offers comprehensive, multidisciplinary care and collaborates with radiology, laboratory services, surgery, chaplaincy, social work, nutrition, and patient navigation teams to provide complete care for our patients.'
                : 'Dr Sitna Mwanzi Oncology Clinic inatoa huduma kamili za taaluma mbalimbali na kushirikiana na timu za radioloji, maabara, upasuaji, ukongozi wa kiroho, kazi za kijamii, lishe, na uongozaji wa wagonjwa ili kutoa huduma kamili kwa wagonjwa wetu.'
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                {language === 'en' ? 'Expert Care' : 'Huduma ya Kitaalamu'}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                  <span className="text-gray-600">
                    {language === 'en' 
                      ? 'Oncology inpatient care with reduced length of stay'
                      : 'Huduma ya wagonjwa wa ndani ya saratani na muda mfupi wa kukaa'
                    }
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                  <span className="text-gray-600">
                    {language === 'en' 
                      ? 'New patient wait time less than 2 days'
                      : 'Muda wa kusubiri wa mgonjwa mpya chini ya siku 2'
                    }
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-pink-600 mt-0.5" />
                  <span className="text-gray-600">
                    {language === 'en' 
                      ? 'Multidisciplinary approach to care'
                      : 'Mbinu ya taaluma nyingi katika huduma'
                    }
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="bg-pink-50 p-8 rounded-lg border border-pink-100">
              <div className="flex items-center mb-4">
                <Star className="w-6 h-6 text-pink-600 mr-2 flex-shrink-0" />
                <h4 className="text-xl font-bold text-gray-900">
                  {language === 'en' ? 'Dr Sitna Mwanzi' : 'Dkt. Sitna Mwanzi'}
                </h4>
              </div>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  {language === 'en' 
                    ? "I'm a medical oncologist and health systems leader with over 20 years of clinical experience and more than a decade dedicated to transforming oncology care in Kenya and the region. My career has been shaped by a commitment to delivering patient-centered care, strengthening health systems, and scaling impactful solutions through collaboration."
                    : 'Mimi ni daktari wa saratani na kiongozi wa mifumo ya afya na uzoefu wa zaidi ya miaka 20 ya kliniki na zaidi ya muongo mmoja nimejitolea kubadilisha huduma za saratani nchini Kenya na eneo lote. Kazi yangu imegubikwa na kujitolea kutoa huduma zinazolenga mgonjwa, kuimarisha mifumo ya afya, na kukuza suluhisho zenye athari kupitia ushirikiano.'
                  }
                </p>
                <p className="font-medium text-pink-900">
                  {language === 'en' 
                    ? 'I provide expert oncology care in general medical oncology with specific focus on breast, lung, prostate cancer and neuroendocrine tumors.'
                    : 'Ninatoa huduma za kitaalamu za saratani katika saratani ya jumla ya matibabu yakilenga hasa saratani ya matiti, mapafu, prostate na vivimbe vya neuroendocrine.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {getTranslation('ourServices', language)}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Oncology services designed to support you through every stage of your journey.'
                : 'Huduma za saratani zilizoundwa kukusaidia katika kila hatua ya safari yako.'
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SERVICES.map((service, index) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap];
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow border-gray-200">
                  <CardHeader>
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-pink-600" />
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-8"
          >
            <Link href="/services">
              <Button variant="outline" size="lg">
                {language === 'en' ? 'View All Services' : 'Ona Huduma Zote'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {language === 'en' ? 'Frequently Asked Questions' : 'Maswali Yanayoulizwa Mara kwa Mara'}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {FAQ.slice(0, 6).map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-pink-600">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              {language === 'en' 
                ? 'Ready to Schedule Your Appointment?' 
                : 'Uko Tayari Kupanga Miadi Yako?'
              }
            </h2>
            <p className="text-xl text-pink-100 mb-8">
              {language === 'en' 
                ? 'Take the first step towards comprehensive cancer care with Doctor Sitna Mwanzi.'
                : 'Chukua hatua ya kwanza kuelekea huduma kamili ya saratani na Daktari Sitna Mwanzi.'
              }
            </p>
            <Link href="/book">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Calendar className="w-5 h-5 mr-2" />
                {getTranslation('bookAppointment', language)}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}