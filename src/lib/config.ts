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
 */

import { Sun, Wind, Thermometer, Home } from 'lucide-react';

// =================================================================
// 1. GLOBAL APP CONFIGURATION
//    Settings that apply across the entire application.
// =================================================================
const global = {
  appName: 'Solaris Navigator',
  appDescription: 'Your API-Driven Solar Sales Funnel',
  logo: '/logo.svg', // Path to your logo file in the /public directory. Leave as null to disable.
  appUrl: 'http://localhost:9002' // Base URL of the app, used for redirects.
};


// =================================================================
// 2. SERVICE SELECTION PAGE (/ - Root)
//    The first page the user sees, where they select a service.
// =================================================================
const serviceSelection = {
  title: 'Welcome!',
  description: 'What service are you interested in today?',
  comingSoonText: 'Coming Soon',
  services: [
    { name: 'Solar', icon: Sun, enabled: true, path: '/prospect-form' },
    { name: 'Roofing', icon: Home, enabled: true, path: '/other-services' },
    { name: 'HVAC', icon: Wind, enabled: true, path: '/other-services' },
    { name: 'Smart Home', icon: Thermometer, enabled: true, path: '/other-services' },
  ],
};


// =================================================================
// 3. PROSPECT INFORMATION PAGE (/prospect-form)
//    The form where the user enters their contact details.
// =================================================================
const prospectForm = {
    title: 'Prospect Information',
    description: "Let's start by gathering some basic information to create your profile.",
    nextPath: '/address-entry', // Where to go after the form is submitted.
    // --- Form Field Labels ---
    firstNameLabel: 'First Name',
    lastNameLabel: 'Last Name',
    companyNameLabel: 'Company Name',
    phoneLabel: 'Phone Number',
    emailLabel: 'Email Address',
    // --- Form Field Placeholders ---
    firstNamePlaceholder: 'John',
    lastNamePlaceholder: 'Doe',
    companyNamePlaceholder: 'ACME Inc.',
    phonePlaceholder: '(555) 123-4567',
    emailPlaceholder: 'john.doe@acme.com',
    // --- Button Text ---
    submitButtonText: 'Continue',
};


// =================================================================
// 4. ADDRESS ENTRY PAGE (/address-entry)
//    Where the user enters the property address for analysis.
// =================================================================
const addressEntry = {
    title: 'Property Address',
    description: 'Enter the address for the solar potential analysis.',
    addressLabel: 'Address',
    placeholder: 'Enter a location',
    instructions: 'Select an address from the dropdown to automatically start the analysis.',
    apiKeyMissingError: 'Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.',
};


// =================================================================
// 5. SOLAR REPORT PAGE (/solar-report)
//    Displays the results of the solar analysis.
// =================================================================
const solarReport = {
    // --- Loading State ---
    loadingTitle: 'Analyzing Solar Potential',
    loadingDescription: (address: string) => `This may take a moment. We're gathering satellite imagery and solar data for ${address}.`,
    // --- Error States ---
    errorTitle: 'Analysis Failed',
    noAddressTitle: 'No Address Found',
    noAddressDescription: 'Please return to the previous page to enter an address for analysis.',
    // --- Page Content ---
    reportTitle: 'Your Personalized Solar Report',
    nextPath: '/financial-details',
    // --- Buttons ---
    retryButton: 'Try Again',
    goBackButton: 'Go Back',
    resetButton: 'Start New Analysis',
    continueButton: 'Continue to Financial Details',
    // --- Metric Cards ---
    metrics: {
        viability: { label: 'Solar Viability Score', description: 'Overall suitability for solar, based on sun exposure.' },
        panelCount: { label: 'Max Panel Count', description: 'The estimated maximum number of solar panels that can fit on your roof.' },
        savings: { label: '20-Year Savings', description: 'Estimated savings over two decades with a cash purchase.' },
        carbonOffset: { label: 'Carbon Offset', description: 'CO₂ offset by generating your own clean energy.' }
    },
    // --- Accordion Details Section ---
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
// 6. FINANCIAL DETAILS PAGE (/financial-details)
//    Where the user provides financial info or uploads a bill.
// =================================================================
const financialDetails = {
    title: 'Financial Details',
    description: 'To help us provide a more accurate quote, please provide your recent energy usage details.',
    nextPath: '/scheduling',
    // --- Formspree Integration ---
    // NOTE: This form is currently configured to NOT require file uploads.
    // To enable file uploads, you must upgrade your Formspree plan and modify the component.
    formspreeEndpoint: 'https://formspree.io/f/mrblnyld', // <-- YOUR FORMSpree ENDPOINT HERE
    formspreeExplanation: 'For a detailed quote, please securely provide your information via our partner form.',
    formspreeButtonText: 'Open Financial Form',
    skipButtonText: 'Skip and Continue',
};


// =================================================================
// 7. OTHER SERVICES PAGE (/other-services)
//    A generic form for non-solar service requests.
// =================================================================
const otherServices = {
    title: 'Tell Us More',
    description: 'Please provide a few more details so we can better assist you.',
    nextPath: '/scheduling',
    // --- Form Fields ---
    needsLabel: 'Please describe your needs',
    needsPlaceholder: 'Example: "I need to replace my roof due to storm damage." or "My AC unit is not cooling properly."',
    creditScoreLabel: 'What is your approximate credit score?',
    interestLevelLabel: 'How soon are you looking to start?',
    // --- Options ---
    creditScoreOptions: [
        { value: 'excellent', label: 'Excellent (720+)' },
        { value: 'good', label: 'Good (680-719)' },
        { value: 'fair', label: 'Fair (620-679)' },
        { value: 'poor', label: 'Needs Work (Below 620)' },
    ],
    interestLevelOptions: [
        { value: 'asap', label: 'Immediately' },
        { value: '1-3m', label: '1-3 Months' },
        { value: 'researching', label: 'Just Researching' },
    ],
    // --- Button ---
    submitButtonText: 'Continue to Scheduling'
};


// =================================================================
// 8. SCHEDULING PAGE (/scheduling)
//    Where the user books an appointment.
// =================================================================
const scheduling = {
    title: 'Schedule Your Consultation',
    description: 'Choose a date and time that works best for you.',
    nextPath: '/confirmation',
    bookingWindowDays: 60, // How many days into the future the user can book.
    availableTimesLabel: 'Available Times for',
    // Times are in the format you want them displayed to the user.
    availableTimes: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
    submitButtonText: 'Confirm Appointment',
};


// =================================================================
// 9. CONFIRMATION PAGE (/confirmation)
//    The final page summarizing the user's submission.
// =================================================================
const confirmation = {
    title: 'Appointment Confirmed!',
    description: "Thank you! Your consultation has been successfully scheduled.",
    nextSteps: "A confirmation email with your summary and appointment details is on its way. Our team will reach out to you shortly.",
    // --- Summary Box ---
    summaryTitle: 'Your Summary',
    summaryNameLabel: 'Name',
    summaryAddressLabel: 'Service Address',
    summaryAppointmentLabel: 'Appointment',
    // --- Buttons ---
    emailButton: 'Email Copy',
    printButton: 'Print Copy',
    startOverButton: 'Start a New Quote',
    // --- Toast Notifications ---
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
  financialDetails,
  otherServices,
  scheduling,
  confirmation,
};
