export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

export const isAnalyticsEnabled = () => {
  return GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-PLACEHOLDER'
}

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && (window as any).gtag && isAnalyticsEnabled()) {
    ;(window as any).gtag('event', eventName, eventParams)
  }
}

// Track appointment bookings
export const trackAppointmentBooked = (appointmentType: string) => {
  trackEvent('appointment_booked', {
    appointment_type: appointmentType,
    clinic: 'Dr Sitna Mwanzi Oncology Clinic',
  })
}

// Track page views
export const trackPageView = (url: string) => {
  trackEvent('page_view', {
    page_path: url,
  })
}

// Track contact form submissions
export const trackContactSubmission = () => {
  trackEvent('generate_lead', {
    form_name: 'contact_form',
    form_location: 'contact_page',
  })
}
