
/**
 * @fileoverview
 * This file contains the central configuration for the application.
 * It's designed to be easily editable to allow for quick customization of text,
 * labels, styles, and features without needing to change the underlying code.
 *
 * Each section is commented to explain its purpose.
 */

import { Sun, Wind, Thermometer, Home } from 'lucide-react';

// =================================================================
// GLOBAL APP CONFIGURATION
// =================================================================
const global = {
  appName: 'Solaris Navigator',
  appDescription: 'Your API-Driven Solar Sales Funnel',
  logo: '/logo.svg', // Placeholder for logo path
  appUrl: 'http://localhost:9002' // Base URL for the app, used for redirects
};

// =================================================================
// SERVICE SELECTION PAGE (/ - Root)
// =================================================================
const serviceSelection = {
  title: 'Welcome!',
  description: 'What service are you interested in today?',
  services: [
    { name: 'Solar', icon: Sun, enabled: true, path: '/solar' },
    { name: 'Roofing', icon: Home, enabled: true, path: '/other-services' },
    { name: 'HVAC', icon: Wind, enabled: true, path: '/other-services' },
    { name: 'Smart Home', icon: Thermometer, enabled: true, path: '/other-services' },
  ],
};

// =================================================================
// PROSPECT INFORMATION PAGE (/prospect-form)
// =================================================================
const prospectForm = {
    title: 'Prospect Information',
    description: "Let's start by gathering some basic information to create your profile.",
};

// =================================================================
// ADDRESS ENTRY PAGE (/address-entry)
// =================================================================
const addressEntry = {
    title: 'Property Address',
    description: 'Enter the address for the solar potential analysis.',
};

// =================================================================
// SOLAR REPORT PAGE (/solar-report)
// =================================================================
const solarReport = {
    loadingTitle: 'Analyzing Solar Potential',
    loadingDescription: (address: string) => `This may take a moment. We're gathering satellite imagery and solar data for ${address}.`,
    reportTitle: 'Your Personalized Solar Report',
};


// =================================================================
// FINANCIAL DETAILS PAGE (/financial-details)
// =================================================================
const financialDetails = {
    title: 'Financial Details',
    description: 'Help us refine your savings estimate by providing your recent energy usage.',
    formspreeEndpoint: 'https://formspree.io/f/mrblnyld', // <-- YOUR FORMSpree ENDPOINT HERE
    monthlyBill: {
        title: 'Your Energy Usage',
        description: 'Adjust the slider to match your average monthly electricity bill.',
        min: 25,
        max: 1000,
        step: 5,
        defaultValue: 150,
    },
};

// =================================================================
// OTHER SERVICES PAGE (/other-services)
// =================================================================
const otherServices = {
    title: 'Tell Us More',
    description: 'Please provide a few more details so we can better assist you.',
    needsLabel: 'Please describe your needs',
    needsPlaceholder: 'Example: "I need to replace my roof due to storm damage." or "My AC unit is not cooling properly."',
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
    ]
};


// =================================================================
// SCHEDULING PAGE (/scheduling)
// =================================================================
const scheduling = {
    title: 'Schedule Your Consultation',
    description: 'Choose a date and time that works best for you.',
    // Times are in 24-hour format but will be displayed as 12-hour AM/PM
    availableTimes: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
};


// =================================================================
// CONFIRMATION PAGE (/confirmation)
// =================================================================
const confirmation = {
    title: 'Appointment Confirmed!',
    description: "Thank you! Your consultation has been successfully scheduled.",
    nextSteps: "A confirmation email with your summary and appointment details is on its way. Our team will reach out to you shortly.",
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
