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
 * =================================================================================================
 *
 *                              HOW TO CUSTOMIZE YOUR APP
 *
 * -------------------------------------------------------------------------------------------------
 *
 * 1. GLOBAL SETTINGS (`global`):
 *    - `appName`: The name of your application, displayed in browser tabs.
 *    - `appDescription`: A brief description for search engine optimization.
 *    - `logo`: The URL for your company's logo. This should be a high-quality image.
 *              Example: 'https://your-company.com/logo.png'
 *
 * 2. PAGE-SPECIFIC TEXT:
 *    - Each section (e.g., `serviceSelection`, `prospectForm`, `solarReport`) corresponds to a
 *      page or major component in the application.
 *    - To change any text the user sees, find the corresponding key and update its value.
 *      For example, to change the main title on the first page, modify `serviceSelection.title`.
 *
 * 3. APPLICATION FLOW (`nextPath`):
 *    - Each page configuration has a `nextPath` property (e.g., `addressEntry.nextPath`).
 *    - This defines where the user is sent after completing that step. You can change these
 *      paths to alter the user journey.
 *
 * 4. STYLING (Colors, Fonts, Sizes):
 *    - For visual styling, refer to the following files:
 *      - **COLORS**: Open `src/app/globals.css`. Inside this file, you will find CSS variables
 *        (e.g., `--primary`, `--background`). You can change these HSL values to match your
 *        brand's color scheme.
 *      - **FONTS & SIZING**: Open `tailwind.config.ts`. This file controls the application's
 *        design system, including fonts, spacing, and border radius.
 *
 * =================================================================================================
 */

import { Sun, Wind, Thermometer, Home } from 'lucide-react';

// =================================================================
// 1. GLOBAL APP CONFIGURATION
//    Settings that apply to the entire application.
// =================================================================
const global = {
  appName: 'Solaris Navigator',
  appDescription: 'Your API-Driven Solar Sales Funnel',
  // Replace this with your company's logo URL.
  // Recommended size: A transparent PNG, at least 300px wide.
  logo: 'https://cdn-fnahm.nitrocdn.com/cxOvFhYadnisiFuLjcPkeAibGAFaPcTV/assets/images/optimized/rev-e0f5a65/zenergy.solar/wp-content/uploads/2022/01/Zenergy-Logo-01-1024x576.png',
};

// =================================================================
// 2. UNIFIED START & PROSPECT PAGE (`/`)
//    The first page the user interacts with.
// =================================================================
const serviceSelection = {
  title: 'Welcome!',
  description: 'Please select a service and provide your contact information to get started.',
  step1Title: 'Step 1: Choose Your Service',
  comingSoonText: 'Coming Soon',
  services: [
    { name: 'Solar', icon: Sun, enabled: true, path: '/address-entry' },
    { name: 'Roofing', icon: Home, enabled: true, path: '/other-services' },
    { name: 'HVAC', icon: Wind, enabled: true, path: '/other-services' },
    { name: 'Smart Home', icon: Thermometer, enabled: true, path: '/other-services' },
  ],
};

const prospectForm = {
    step2Title: 'Step 2: Tell Us About Yourself',
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
    addressLabel: 'Street Address',
    addressPlaceholder: '123 Main St',
    stateLabel: 'State',
    statePlaceholder: 'Select your state',
    zipCodeLabel: 'Zip Code',
    zipCodePlaceholder: '12345',
    submitButtonText: 'Continue',
};

// =================================================================
// 3. ADDRESS ENTRY PAGE (`/address-entry`) (SOLAR PATH ONLY)
// =================================================================
const addressEntry = {
    title: 'Confirm Your Property Address',
    description: 'Select your address from the list to begin the solar analysis.',
    addressLabel: 'Address',
    placeholder: 'Enter a location',
    instructions: 'Confirming your address ensures we analyze the correct rooftop for solar potential.',
    apiKeyMissingError: 'Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.',
    // This is where the user goes after confirming their address.
    nextPath: '/solar-report',
};

// =================================================================
// 4. SOLAR REPORT PAGE (`/solar-report`) (SOLAR PATH ONLY)
// =================================================================
const solarReport = {
    loading: {
      title: "Analyzing Solar Potential",
      initial: "Initializing analysis...",
      fetching: "Gathering satellite imagery and solar data for your address...",
      rendering: "Rendering visualization and financial data...",
    },
    errorTitle: 'Analysis Failed',
    noAddressTitle: 'No Address Found',
    noAddressDescription: 'Please return to the previous page to enter an address for analysis.',
    reportTitle: 'Your Personalized Solar Report',
    // This is where the user goes after viewing their solar report.
    nextPath: '/financial-details',
    retryButton: 'Try a Different Address',
    goBackButton: 'Go Back',
    resetButton: 'Start New Analysis',
    continueButton: 'Continue to Next Steps',
    skipButton: 'Skip for now',
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
            title: 'CRM Integration Data',
            description: "The following data object represents the enriched information that would be stored in your CRM. This provides your sales team with actionable intelligence for lead prioritization and follow-up."
        }
    }
};

// =================================================================
// 5. OTHER SERVICES PAGE (`/other-services`) (NON-SOLAR PATHS)
// =================================================================
const otherServices = {
    title: 'Tell Us More',
    description: 'Please provide a few more details so we can better assist you.',
    // This is where the user goes after describing their needs for non-solar services.
    nextPath: '/financial-details',
    serviceTypeLabel: 'What type of service do you need?',
    serviceTypePlaceholder: 'Select a service type',
    // You can add, remove, or change these options for the service type dropdown.
    serviceTypeOptions: [
        { value: 'installation', label: 'Installation' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'repair', label: 'Repair' },
        { value: 'estimate', label: 'Estimate' },
        { value: 'other', label: 'Other' },
    ],
    needsLabel: 'Please describe your needs in more detail',
    needsPlaceholder: 'e.g., "I need a quote for a new HVAC system for a 2,000 sq ft house." or "My roof is leaking and I need an urgent repair."',
    submitButtonText: 'Continue'
};

// =================================================================
// 6. FINANCIAL DETAILS PAGE (`/financial-details`) (ALL PATHS)
// =================================================================
const financialDetails = {
    title: 'Final Steps',
    description: 'Just a few more details to help us prepare for your consultation.',
    // This is where the user goes after providing financial information.
    nextPath: '/scheduling',
    monthlyBillLabel: 'Average Monthly Electric Bill',
    billUploadTitle: "Want a More Accurate Quote? (Feature Disabled)",
    billUploadDescription: "To enable file uploads, please upgrade your Formspree plan.",
    creditScoreLabel: 'What is your approximate credit score?',
    // You can customize the credit score tiers here.
    creditScoreOptions: [
        { value: 'excellent', label: 'Excellent', range: '720+' },
        { value: 'good', label: 'Good', range: '640-719' },
        { value: 'fair', label: 'Fair', range: '600-639' },
        { value: 'poor', label: 'Needs Work', range: 'Below 600' },
    ],
    interestLevelLabel: 'How soon are you looking to start?',
    // You can customize the interest level options here.
    interestLevelOptions: [
        { value: 'asap', label: 'Immediately' },
        { value: '1-3m', label: '1-3 Months' },
        { value: 'researching', label: 'Just Researching' },
    ],
    submitButtonText: 'Continue to Scheduling',
};

// =================================================================
// 7. SCHEDULING PAGE (`/scheduling`) (ALL PATHS)
// =================================================================
const scheduling = {
    title: 'Schedule Your Consultation',
    description: 'Choose a date and time that works best for you.',
    // This is the final step before the confirmation page.
    nextPath: '/confirmation',
    // How many days into the future the user can book.
    bookingWindowDays: 60,
    availableTimesLabel: 'Available Times for',
    // Customize the available time slots for appointments.
    availableTimes: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
    submitButtonText: 'Confirm Appointment',
};

// =================================================================
// 8. CONFIRMATION PAGE (`/confirmation`) (ALL PATHS)
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
