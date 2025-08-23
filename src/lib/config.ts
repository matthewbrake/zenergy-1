
/**
 * @fileoverview
 * =================================================================================================
 *
 *                                    MASTER CONFIGURATION FILE
 *
 * =================================================================================================
 * This file contains the central configuration for the entire application. It is designed to be
 * the single source of truth for all user-facing text, labels, form settings, and navigation
 * paths. By modifying the values in this file, you can customize the application's content and
 * behavior without altering the core React components.
 *
 * To change visual styles like colors, fonts, or spacing, please refer to:
 * - `src/app/globals.css`: For theme colors (primary, background, etc.) and global CSS variables.
 * - `tailwind.config.ts`: For Tailwind CSS utility classes and theme extensions.
 *
 * =================================================================================================
 *
 *                              APPLICATION FLOW ARCHITECTURE
 *
 * -------------------------------------------------------------------------------------------------
 *
 * 1. SOLAR PATH:
 *    - Step 1: `/` (Service Selection) -> User clicks "Solar"
 *    - Step 2: `/prospect-form` -> User enters contact info.
 *    - Step 3: `/address-entry` -> User enters property address for analysis.
 *    - Step 4: `/solar-report` -> Displays API results (map, panels, savings).
 *    - Step 5: `/financial-details` -> User provides bill, credit, and interest info.
 *    - Step 6: `/scheduling` -> User books an appointment.
 *    - Step 7: `/confirmation` -> Shows a summary of all collected data.
 *
 * 2. OTHER SERVICES PATH (Roofing, HVAC, Smart Home):
 *    - Step 1: `/` (Service Selection) -> User clicks "Roofing", "HVAC", etc.
 *    - Step 2: `/prospect-form` -> User enters contact info.
 *    - Step 3: `/other-services` -> User describes their specific needs.
 *    - Step 4: `/financial-details` -> User provides credit and interest info (bill section is hidden).
 *    - Step 5: `/scheduling` -> User books an appointment.
 *    - Step 6: `/confirmation` -> Shows a summary of all collected data.
 *
 * =================================================================================================
 */

import { Sun, Wind, Thermometer, Home } from 'lucide-react';

// =================================================================
// 1. GLOBAL APP CONFIGURATION
//    Settings that apply across the entire application.
// =================================================================
const global = {
  appName: 'Solaris Navigator',
  displayAppName: false, // Set to `false` to hide the app name, `true` to show it.
  appDescription: 'Your API-Driven Solar Sales Funnel',
  // To change the logo, simply replace the URL below with the link to your desired image.
  logo: 'https://cdn-fnahm.nitrocdn.com/cxOvFhYadnisiFuLjcPkeAibGAFaPcTV/assets/images/optimized/rev-e0f5a65/zenergy.solar/wp-content/uploads/2022/01/Zenergy-Logo-01-1024x576.png',
  appUrl: 'http://localhost:9002' // Base URL of the app, used for redirects.
};


// =================================================================
// 2. SERVICE SELECTION PAGE (`/`)
//    The first page the user sees, where they select a service.
// =================================================================
const serviceSelection = {
  title: 'Welcome!',
  description: 'What service are you interested in today?',
  comingSoonText: 'Coming Soon',
  services: [
    { name: 'Solar', icon: Sun, enabled: true, path: '/prospect-form' }, // Solar path starts at prospect form
    { name: 'Roofing', icon: Home, enabled: true, path: '/other-services' },
    { name: 'HVAC', icon: Wind, enabled: true, path: '/other-services' },
    { name: 'Smart Home', icon: Thermometer, enabled: true, path: '/other-services' },
  ],
};


// =================================================================
// 3. PROSPECT INFORMATION PAGE (`/prospect-form`)
//    The form where the user enters their contact details. This is the
//    first step for all user paths.
// =================================================================
const prospectForm = {
    title: 'Prospect Information',
    description: "Let's start by gathering some basic information to create your profile.",
    // nextPath is determined dynamically on the page based on the service selected
    nextPath: {
      solar: '/address-entry',
      other: '/other-services'
    },
    // --- Form Field Labels & Placeholders ---
    firstNameLabel: 'First Name',
    firstNamePlaceholder: 'John',
    lastNameLabel: 'Last Name',
    lastNamePlaceholder: 'Doe',
    companyNameLabel: 'Company Name (Optional)',
    companyNamePlaceholder: 'ACME Inc.',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '(555) 123-4567',
    emailLabel: 'Email Address',
    emailPlaceholder: 'john.doe@acme.com',
    submitButtonText: 'Continue',
};


// =================================================================
// 4. ADDRESS ENTRY PAGE (`/address-entry`)
//    (SOLAR PATH ONLY) Where the user enters the property address.
// =================================================================
const addressEntry = {
    title: 'Property Address',
    description: 'Enter the address for the solar potential analysis.',
    addressLabel: 'Address',
    placeholder: 'Enter a location',
    instructions: 'Select an address from the dropdown to automatically start the analysis.',
    apiKeyMissingError: 'Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.',
    nextPath: '/solar-report',
};


// =================================================================
// 5. SOLAR REPORT PAGE (`/solar-report`)
//    (SOLAR PATH ONLY) Displays the results of the solar analysis.
// =================================================================
const solarReport = {
    loadingTitle: 'Analyzing Solar Potential',
    loadingDescription: (address: string) => `This may take a moment. We're gathering satellite imagery and solar data for ${address}.`,
    errorTitle: 'Analysis Failed',
    noAddressTitle: 'No Address Found',
    noAddressDescription: 'Please return to the previous page to enter an address for analysis.',
    reportTitle: 'Your Personalized Solar Report',
    nextPath: '/financial-details',
    retryButton: 'Try Again',
    goBackButton: 'Go Back',
    resetButton: 'Start New Analysis',
    continueButton: 'Continue to Financial Details',
    metrics: {
        viability: { label: 'Solar Viability Score', description: 'Overall suitability for solar, based on sun exposure.' },
        panelCount: { label: 'Max Panel Count', description: 'Estimated maximum panels that fit on your roof.' },
        savings: { label: '20-Year Savings', description: 'Estimated savings over two decades with a cash purchase.' },
        carbonOffset: { label: 'Carbon Offset', description: 'CO₂ offset by generating your own clean energy.' }
    },
    details: {
        title: 'Financial & Technical Details',
        description: "Explore the potential savings, system output, and data we've collected.",
        financials: {
            title: 'Financial Summary',
            noData: 'Financial analysis data is not available for this location.'
        },
        crm: {
            title: 'CRM Integration Data'
        }
    }
};


// =================================================================
// 6. OTHER SERVICES PAGE (`/other-services`)
//    (NON-SOLAR PATHS) A generic form for non-solar service requests.
// =================================================================
const otherServices = {
    title: 'Tell Us More',
    description: 'Please provide a few more details so we can better assist you.',
    nextPath: '/financial-details',
    needsLabel: 'Please describe your needs',
    needsPlaceholder: 'Example: "I need to replace my roof due to storm damage." or "My AC unit is not cooling properly."',
    submitButtonText: 'Continue'
};


// =================================================================
// 7. FINANCIAL DETAILS PAGE (`/financial-details`)
//    (ALL PATHS) Gathers bill info (solar only), credit score, and
//    interest level. This is the final data collection step.
// =================================================================
const financialDetails = {
    title: 'Next Steps & Financials',
    description: 'Just a few more details to help us prepare for your consultation.',
    nextPath: '/scheduling',
    // --- Bill Slider (Solar Only) ---
    monthlyBillLabel: 'Average Monthly Electric Bill',
    // --- Bill Upload ---
    billUploadTitle: "Want a More Accurate Quote?",
    billUploadDescription: "In a full production environment, you could enable a feature here to upload the last 4 months of your utility bill (PDF/Image, <5MB each). This feature requires a paid Formspree plan or a custom backend.",
    // --- Credit Score & Interest Level (All Paths) ---
    creditScoreLabel: 'What is your approximate credit score?',
    creditScoreOptions: [
        { value: 'excellent', label: 'Excellent (720+)' },
        { value: 'good', label: 'Good (680-719)' },
        { value: 'fair', label: 'Fair (620-679)' },
        { value: 'poor', label: 'Needs Work (Below 620)' },
    ],
    interestLevelLabel: 'How soon are you looking to start?',
    interestLevelOptions: [
        { value: 'asap', label: 'Immediately' },
        { value: '1-3m', label: '1-3 Months' },
        { value: 'researching', label: 'Just Researching' },
    ],
    submitButtonText: 'Continue to Scheduling',
};


// =================================================================
// 8. SCHEDULING PAGE (`/scheduling`)
//    (ALL PATHS) Where the user books an appointment.
// =================================================================
const scheduling = {
    title: 'Schedule Your Consultation',
    description: 'Choose a date and time that works best for you.',
    nextPath: '/confirmation',
    bookingWindowDays: 60, // How many days into the future the user can book.
    availableTimesLabel: 'Available Times for',
    availableTimes: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
    submitButtonText: 'Confirm Appointment',
};


// =================================================================
// 9. CONFIRMATION PAGE (`/confirmation`)
//    (ALL PATHS) The final page summarizing the user's submission.
// =================================================================
const confirmation = {
    title: 'Appointment Confirmed!',
    description: "Thank you! Your consultation has been successfully scheduled.",
    nextSteps: "A confirmation email with your summary and appointment details is on its way. Our team will reach out to you shortly.",
    summaryTitle: 'Your Summary',
    summaryNameLabel: 'Name',
    summaryAddressLabel: 'Service Address',
    summaryAppointmentLabel: 'Appointment',
    emailButton: 'Email Copy',
    printButton: 'Print Copy',
    startOverButton: 'Start a New Quote',
    emailSuccessTitle: 'Email Sent',
    emailSuccessDescription: 'A copy of your summary has been sent to your email address.',
};


// =================================================================
// EXPORT THE CONFIGURATION
// =================================================================
export const appConfig = {
  global,
  serviceSelection,
  prospectForm,
  addressEntry,
  solarReport,
  otherServices,
  financialDetails,
  scheduling,
  confirmation,
};
