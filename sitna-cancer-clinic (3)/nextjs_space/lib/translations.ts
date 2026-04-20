
export const translations = {
  // General
  welcome: {
    en: 'Welcome to Dr Sitna Mwanzi Oncology Clinic',
    sw: 'Karibu Dr Sitna Mwanzi Oncology Clinic',
  },
  bookAppointment: {
    en: 'Book Appointment',
    sw: 'Weka Miadi',
  },
  emergency: {
    en: 'If this is a life-threatening emergency, please call emergency services immediately.',
    sw: 'Iwapo ni dharura inayohatarisha maisha, tafadhali pigia huduma za dharura mara moja.',
  },
  
  // Form fields
  fullName: {
    en: 'Full Name',
    sw: 'Jina Kamili',
  },
  dateOfBirth: {
    en: 'Date of Birth',
    sw: 'Tarehe ya Kuzaliwa',
  },
  phoneNumber: {
    en: 'Phone Number',
    sw: 'Nambari ya Simu',
  },
  email: {
    en: 'Email (Optional)',
    sw: 'Barua Pepe (Si Lazima)',
  },
  reasonForVisit: {
    en: 'Reason for Visit',
    sw: 'Sababu ya Kutembelea',
  },
  preferredDate: {
    en: 'Preferred Date',
    sw: 'Tarehe Unayopendelea',
  },
  preferredTime: {
    en: 'Preferred Time',
    sw: 'Muda Unapendelea',
  },
  
  // Actions
  submit: {
    en: 'Submit',
    sw: 'Wasilisha',
  },
  cancel: {
    en: 'Cancel',
    sw: 'Ghairi',
  },
  confirm: {
    en: 'Confirm',
    sw: 'Thibitisha',
  },
  reschedule: {
    en: 'Reschedule',
    sw: 'Panga Upya',
  },
  
  // Status
  pending: {
    en: 'Pending',
    sw: 'Inasubiri',
  },
  confirmed: {
    en: 'Confirmed',
    sw: 'Imethibitishwa',
  },
  cancelled: {
    en: 'Cancelled',
    sw: 'Imeghairiwa',
  },
  
  // Pages
  aboutClinic: {
    en: 'About Our Clinic',
    sw: 'Kuhusu Kliniki Yetu',
  },
  ourServices: {
    en: 'Our Services',
    sw: 'Huduma Zetu',
  },
  contactUs: {
    en: 'Contact Us',
    sw: 'Wasiliana Nasi',
  },
  
  // Clinic info
  operatingHours: {
    en: 'PMC: Mon & Thu 2-6PM | KNH: Mon, Tue & Fri 10AM-1PM',
    sw: 'PMC: Jtt & Alh 2-6PM | KNH: Jtt, Jnn & Iju 10AM-1PM',
  },
  
  // Confirmation messages
  appointmentBooked: {
    en: 'Your appointment has been successfully booked!',
    sw: 'Miadi yako imewekwa kwa mafanikio!',
  },
  appointmentConfirmation: {
    en: 'Appointment Confirmation',
    sw: 'Uthibitishaji wa Miadi',
  },
  
  // Instructions
  arrivalInstructions: {
    en: 'Please arrive 10 minutes early and bring your ID and any prior medical records.',
    sw: 'Tafadhali fika dakika 10 mapema na uleta kitambulisho chako na rekodi zoyote za kimatibabu za awali.',
  },
};

export type Language = 'en' | 'sw';

export function getTranslation(key: string, language: Language): string {
  const translation = translations[key as keyof typeof translations];
  return translation ? translation[language] : key;
}

export function detectLanguage(text: string): Language {
  // Simple language detection based on common Swahili words
  const swahiliWords = ['karibu', 'asante', 'tafadhali', 'habari', 'ndiyo', 'hapana', 'sawa', 'na', 'kwa'];
  const textLower = text.toLowerCase();
  
  for (const word of swahiliWords) {
    if (textLower.includes(word)) {
      return 'sw';
    }
  }
  
  return 'en';
}
