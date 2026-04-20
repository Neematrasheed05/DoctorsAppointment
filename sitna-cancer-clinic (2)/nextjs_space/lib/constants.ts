// Detailed clinic location schedules used for booking slot generation.
// days: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
export const LOCATION_SCHEDULES = [
  {
    id: 'pmc',
    name: 'PMC Building',
    fullName: 'PMC Building, 6th Floor, Room 608',
    address: 'PMC Building, 6th Floor, Room 608, 3rd Parklands, Nairobi',
    days: [1, 4], // Monday & Thursday
    startHour: 14, // 2:00 PM
    endHour: 18,   // 6:00 PM
    daysLabel: 'Monday & Thursday',
    hoursLabel: 'Monday & Thursday: 2:00 PM - 6:00 PM',
    timeRangeLabel: '2:00 PM - 6:00 PM',
  },
  {
    id: 'knh',
    name: 'KNH Doctors Plaza',
    fullName: 'KNH Doctors Plaza, Room 26',
    address: 'KNH Doctors Plaza, Room 26, Nairobi',
    days: [1, 2, 5], // Monday, Tuesday, Friday
    startHour: 10, // 10:00 AM
    endHour: 13,   // 1:00 PM
    daysLabel: 'Monday, Tuesday & Friday',
    hoursLabel: 'Monday, Tuesday & Friday: 10:00 AM - 1:00 PM',
    timeRangeLabel: '10:00 AM - 1:00 PM',
  },
] as const;

export type LocationScheduleId = typeof LOCATION_SCHEDULES[number]['id'];

export const CLINIC_INFO = {
  name: 'Dr Sitna Mwanzi Oncology Clinic',
  doctor: 'Dr. Sitna Mwanzi',
  specialty: 'Oncology (Cancer Care)',
  phone: '0717333452',
  timezone: 'Africa/Nairobi',
  email: 'info@sitnacancerclinic.ke',
  emergencyInstructions: 'For life-threatening emergencies, call emergency services immediately.',
  arrivalInstructions: 'Please arrive 10 minutes early and bring your ID and any prior medical records.',
  locations: LOCATION_SCHEDULES.map(loc => ({
    name: loc.name,
    address: loc.address,
    hours: loc.hoursLabel,
  })),
};

export const SERVICES = [
  {
    name: 'Cancer Diagnosis and Screening',
    description: 'Early detection via imaging, biopsies, blood tests, and genetic testing for hereditary risks',
    icon: 'Search',
  },
  {
    name: 'Cancer Treatment Solutions',
    description: 'Chemotherapy, Radiation Therapy, Immunotherapy, Surgery, and Targeted Therapy',
    icon: 'Zap',
  },
  {
    name: 'Palliative Care',
    description: 'Pain and symptom management, emotional and psychological support',
    icon: 'Heart',
  },
  {
    name: 'Oncology Consultations',
    description: 'Personalized treatment plans, second opinions, and multidisciplinary team reviews',
    icon: 'Users',
  },
  {
    name: 'Support Services',
    description: 'Nutritional counseling, physical therapy, rehabilitation, and support groups for patients and caregivers',
    icon: 'Shield',
  },
];

export const FAQ = [
  {
    question: 'What are your operating hours?',
    answer: 'PMC Building, 6th Floor, Room 608: Monday & Thursday, 2:00 PM - 6:00 PM. KNH Doctors Plaza, Room 26: Monday, Tuesday & Friday, 10:00 AM - 1:00 PM.',
  },
  {
    question: 'Do you accept insurance?',
    answer: 'Please contact us to discuss insurance and payment options.',
  },
  {
    question: 'Do you offer telehealth services?',
    answer: 'Yes, we offer telehealth consultations. Please contact us to schedule a virtual appointment.',
  },
  {
    question: 'How long is a typical appointment?',
    answer: 'A typical consultation appointment is 45 minutes.',
  },
  {
    question: 'What should I bring to my appointment?',
    answer: 'Please bring a valid ID and any prior medical records, lab results, or imaging studies related to your condition.',
  },
  {
    question: 'How early should I arrive?',
    answer: 'Please arrive 10 minutes before your scheduled appointment time.',
  },
  {
    question: 'Can I reschedule or cancel my appointment?',
    answer: 'Yes, you can reschedule or cancel your appointment. Please contact us as soon as possible or use our online system.',
  },
];

export const WORKING_HOURS = [
  { day: 'Monday', hours: '08:00 - 17:00', open: true },
  { day: 'Tuesday', hours: '08:00 - 17:00', open: true },
  { day: 'Wednesday', hours: '08:00 - 17:00', open: true },
  { day: 'Thursday', hours: '08:00 - 17:00', open: true },
  { day: 'Friday', hours: '08:00 - 17:00', open: true },
  { day: 'Saturday', hours: '08:00 - 17:00', open: true },
  { day: 'Sunday', hours: 'Closed', open: false },
];

export const TIME_SLOTS = [
  '08:00', '08:45', '09:30', '10:15', '11:00', '11:45',
  '13:00', '13:45', '14:30', '15:15', '16:00'
];
