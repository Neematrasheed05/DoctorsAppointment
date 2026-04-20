
import { PrismaClient, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin users
  const adminEmail = 'john@doe.com';
  const adminPassword = 'johndoe123';
  
  const primaryAdminEmail = 'admin@sitnaclinic.ke';
  const primaryAdminPassword = 'admin123';
  
  const mainAdminEmail = 'admin@sitna.com';
  const mainAdminPassword = 'admin123';
  
  const drSitnaEmail = 'admin@sitnaclinic.com';
  const drSitnaPassword = 'DrSitna2024!';

  // Hash passwords
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
  const hashedPrimaryAdminPassword = await bcrypt.hash(primaryAdminPassword, 12);
  const hashedMainAdminPassword = await bcrypt.hash(mainAdminPassword, 12);
  const hashedDrSitnaPassword = await bcrypt.hash(drSitnaPassword, 12);

  // Create test admin user
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Test Admin',
      password: hashedAdminPassword,
      role: 'admin',
    },
  });

  // Create primary admin user
  await prisma.user.upsert({
    where: { email: primaryAdminEmail },
    update: {},
    create: {
      email: primaryAdminEmail,
      name: 'Admin',
      password: hashedPrimaryAdminPassword,
      role: 'admin',
    },
  });

  // Create main admin user (the one user will use)
  await prisma.user.upsert({
    where: { email: mainAdminEmail },
    update: {},
    create: {
      email: mainAdminEmail,
      name: 'Sitna Admin',
      password: hashedMainAdminPassword,
      role: 'admin',
    },
  });

  // Create Dr. Sitna admin user
  const drSitnaUser = await prisma.user.upsert({
    where: { email: drSitnaEmail },
    update: {},
    create: {
      email: drSitnaEmail,
      name: 'Dr. Sitna Mwanzi',
      password: hashedDrSitnaPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin users created');

  // Create clinic settings
  const clinicSettings = [
    {
      key: 'clinic_name',
      value: 'Dr Sitna Mwanzi Oncology Clinic',
      description: 'Name of the clinic',
    },
    {
      key: 'consultation_fee',
      value: '5000',
      description: 'Consultation fee in KES',
    },
    {
      key: 'working_hours_start',
      value: '08:00',
      description: 'Daily opening time',
    },
    {
      key: 'working_hours_end',
      value: '17:00',
      description: 'Daily closing time',
    },
    {
      key: 'appointment_duration',
      value: '45',
      description: 'Default appointment duration in minutes',
    },
    {
      key: 'phone_number',
      value: '0717333452',
      description: 'Clinic contact phone number',
    },
  ];

  for (const setting of clinicSettings) {
    await prisma.clinicSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    });
  }

  console.log('✅ Clinic settings created');

  // Create default availability slots for the next 30 days
  const startDate = new Date();
  const timeSlots = [
    '08:00', '08:45', '09:30', '10:15', '11:00', '11:45',
    '13:00', '13:45', '14:30', '15:15', '16:00'
  ];

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Skip Sundays (day 0)
    if (currentDate.getDay() === 0) {
      continue;
    }

    for (const timeSlot of timeSlots) {
      const endTimeHour = parseInt(timeSlot.split(':')[0]);
      const endTimeMinute = parseInt(timeSlot.split(':')[1]) + 45; // 45-minute appointment
      const endTime = `${endTimeHour + (endTimeMinute >= 60 ? 1 : 0).toString().padStart(2, '0')}:${(endTimeMinute % 60).toString().padStart(2, '0')}`;

      await prisma.availabilitySlot.upsert({
        where: {
          date_startTime: {
            date: currentDate,
            startTime: timeSlot,
          },
        },
        update: {},
        create: {
          date: currentDate,
          startTime: timeSlot,
          endTime: endTime,
          isAvailable: true,
          isBlocked: false,
        },
      });
    }
  }

  console.log('✅ Default availability slots created for next 30 days');

  // Create sample patients and appointments (for testing)
  const samplePatients = [
    {
      id: 'patient-1',
      fullName: 'Mary Wanjiku',
      dateOfBirth: new Date('1980-05-15'),
      phone: '+254712345678',
      email: 'mary.wanjiku@example.com',
    },
    {
      id: 'patient-2',
      fullName: 'John Kamau',
      dateOfBirth: new Date('1975-08-22'),
      phone: '+254723456789',
      email: 'john.kamau@example.com',
    },
    {
      id: 'patient-3',
      fullName: 'Grace Njeri',
      dateOfBirth: new Date('1985-03-10'),
      phone: '+254734567890',
      email: 'grace.njeri@example.com',
    },
    {
      id: 'patient-4',
      fullName: 'Peter Ochieng',
      dateOfBirth: new Date('1970-12-05'),
      phone: '+254745678901',
      email: 'peter.ochieng@example.com',
    },
    {
      id: 'patient-5',
      fullName: 'Sarah Akinyi',
      dateOfBirth: new Date('1988-06-18'),
      phone: '+254756789012',
      email: 'sarah.akinyi@example.com',
    },
  ];

  for (const patientData of samplePatients) {
    await prisma.patient.upsert({
      where: { id: patientData.id },
      update: {},
      create: patientData,
    });
  }

  console.log('✅ Sample patients created');

  // Create appointments with different statuses.
  // Location schedules:
  //   PMC Building (Mon=1, Thu=4): 14:00, 14:45, 15:30, 16:15, 17:00
  //   KNH Doctors Plaza (Mon=1, Tue=2, Fri=5): 10:00, 10:45, 11:30, 12:15
  const today = new Date();

  // Helper: given a reference date and an array of valid weekdays (0=Sun..6=Sat),
  // find the next date at or after the reference that matches one of the weekdays.
  const nextMatchingDate = (from: Date, validDays: number[], forwardOnly = true): Date => {
    const d = new Date(from);
    for (let i = 0; i < 14; i++) {
      const candidate = new Date(d);
      candidate.setDate(d.getDate() + (forwardOnly ? i : -i));
      if (validDays.includes(candidate.getDay())) {
        return candidate;
      }
    }
    return d;
  };

  const pmcDays = [1, 4]; // Mon, Thu
  const knhDays = [1, 2, 5]; // Mon, Tue, Fri

  // Upcoming PMC date (Mon/Thu), at least tomorrow
  const nextPmcDate = nextMatchingDate(new Date(today.getTime() + 24 * 60 * 60 * 1000), pmcDays);
  // Next KNH date (Mon/Tue/Fri) after PMC date
  const nextKnhDate = nextMatchingDate(new Date(nextPmcDate.getTime() + 24 * 60 * 60 * 1000), knhDays);
  // Further-out PMC date
  const laterPmcDate = nextMatchingDate(new Date(nextKnhDate.getTime() + 2 * 24 * 60 * 60 * 1000), pmcDays);
  // Further-out KNH date
  const laterKnhDate = nextMatchingDate(new Date(laterPmcDate.getTime() + 24 * 60 * 60 * 1000), knhDays);

  // A past PMC date (3-10 days ago) for the COMPLETED example
  const pastPmcDate = nextMatchingDate(
    new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
    pmcDays,
    true
  );

  const sampleAppointments = [
    {
      id: 'appt-1',
      patientId: 'patient-1',
      fullName: 'Mary Wanjiku',
      dateOfBirth: new Date('1980-05-15'),
      phone: '+254712345678',
      email: 'mary.wanjiku@example.com',
      reasonForVisit: 'Routine oncology consultation and follow-up',
      appointmentDate: nextPmcDate,
      appointmentTime: '14:00',
      duration: 45,
      location: 'PMC Building',
      status: AppointmentStatus.CONFIRMED,
      reminderConsent: true,
      paymentInstructions: 'Payment: KES 5,000 via M-Pesa (0717333452) or cash at clinic',
      notes: 'Regular follow-up appointment',
    },
    {
      id: 'appt-2',
      patientId: 'patient-2',
      fullName: 'John Kamau',
      dateOfBirth: new Date('1975-08-22'),
      phone: '+254723456789',
      email: 'john.kamau@example.com',
      reasonForVisit: 'Chemotherapy session',
      appointmentDate: nextKnhDate,
      appointmentTime: '10:00',
      duration: 45,
      location: 'KNH Doctors Plaza',
      status: AppointmentStatus.CONFIRMED,
      reminderConsent: true,
      paymentInstructions: 'Payment: KES 5,000 via M-Pesa (0717333452) or cash at clinic',
      notes: 'Chemotherapy cycle 3',
    },
    {
      id: 'appt-3',
      patientId: 'patient-3',
      fullName: 'Grace Njeri',
      dateOfBirth: new Date('1985-03-10'),
      phone: '+254734567890',
      email: 'grace.njeri@example.com',
      reasonForVisit: 'Initial consultation for breast cancer screening',
      appointmentDate: laterKnhDate,
      appointmentTime: '11:30',
      duration: 45,
      location: 'KNH Doctors Plaza',
      status: AppointmentStatus.PENDING,
      reminderConsent: true,
      paymentInstructions: 'Payment: KES 5,000 via M-Pesa (0717333452) or cash at clinic',
      notes: 'New patient consultation',
    },
    {
      id: 'appt-4',
      patientId: 'patient-4',
      fullName: 'Peter Ochieng',
      dateOfBirth: new Date('1970-12-05'),
      phone: '+254745678901',
      email: 'peter.ochieng@example.com',
      reasonForVisit: 'Post-surgery follow-up',
      appointmentDate: pastPmcDate,
      appointmentTime: '15:30',
      duration: 45,
      location: 'PMC Building',
      status: AppointmentStatus.COMPLETED,
      reminderConsent: true,
      paymentInstructions: 'Payment: KES 5,000 via M-Pesa (0717333452) or cash at clinic',
      notes: 'Follow-up completed successfully',
    },
    {
      id: 'appt-5',
      patientId: 'patient-5',
      fullName: 'Sarah Akinyi',
      dateOfBirth: new Date('1988-06-18'),
      phone: '+254756789012',
      email: 'sarah.akinyi@example.com',
      reasonForVisit: 'Cancer pain management consultation',
      appointmentDate: laterPmcDate,
      appointmentTime: '16:15',
      duration: 45,
      location: 'PMC Building',
      status: AppointmentStatus.PENDING,
      reminderConsent: true,
      paymentInstructions: 'Payment: KES 5,000 via M-Pesa (0717333452) or cash at clinic',
      notes: 'Pain management assessment',
    },
  ];

  for (const appointmentData of sampleAppointments) {
    await prisma.appointment.upsert({
      where: { id: appointmentData.id },
      update: {},
      create: appointmentData,
    });
  }

  console.log('✅ Sample appointments created with various statuses');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Admin Login Credentials:');
  console.log(`🔑 Main Admin: ${mainAdminEmail} / ${mainAdminPassword}`);
  console.log(`🔑 Primary Admin: ${primaryAdminEmail} / ${primaryAdminPassword}`);
  console.log(`👤 Dr. Sitna: ${drSitnaEmail} / ${drSitnaPassword}`);
  console.log(`🔧 Test Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
