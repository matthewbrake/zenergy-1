
# Solaris Navigator - Product Guide

This document outlines the intended features, user flows, and data collection points for the Solaris Navigator application. It serves as a single source of truth for the app's functionality.

## 1. Core Objective

The primary goal of this application is to provide a comprehensive, API-driven sales funnel for various home services, with a special focus on solar energy analysis. It should capture lead information, provide value to the user (e.g., a solar report), and book a consultation, sending all collected data to a CRM endpoint (Formspree) upon completion.

## 2. Data Persistence Strategy

To create a seamless multi-page experience, all data collected from the user during a single session will be stored in the browser's **local storage**. This data is only compiled and sent to the final endpoint on the confirmation page. This prevents data loss between pages and avoids premature form submissions.

**Data is stored under the following local storage keys:**
- `serviceChoice`: (e.g., 'Solar', 'Roofing')
- `prospectData`: (First name, last name, email, phone, etc.)
- `addressData`: (Geocoded address, lat/lng, placeId from Google Maps)
- `analysisResult`: (The full JSON response from the Solar API)
- `otherServicesData`: (Service type and description for non-solar journeys)
- `financialData`: (Monthly bill, credit score, interest level)
- `appointmentData`: (Selected date and time for consultation)

All keys are cleared when the user clicks "Start a New Quote" on the confirmation page.

## 3. User Journeys

The application has two main user journeys that start from the landing page.

### Journey A: The Solar Path

This flow is for users interested in a solar panel installation.

-   **Step 1: Landing Page (`/`)**
    -   User selects "Solar".
    -   User fills out their contact information: First Name, Last Name, Company, Phone, Email, and full property address (Street, State, Zip).
    -   On submit, data is saved to `prospectData` and `serviceChoice` in local storage.
    -   User is redirected to `/address-entry`.

-   **Step 2: Address Entry (`/address-entry`)**
    -   The address from the previous step is pre-filled.
    -   User confirms their address using Google Maps Autocomplete for high accuracy. This triggers a call to get geocoded data.
    -   The accurate `addressData` object (with lat/lng) is saved to local storage.
    -   A **"Skip to Next Step"** button is available to bypass the solar analysis. If clicked, the user is taken directly to `/financial-details`.
    -   On successful address confirmation, user is redirected to `/solar-report`.

-   **Step 3: Solar Report (`/solar-report`)**
    -   If the address was confirmed, the app calls the Google Solar API server action using the `addressData`.
    -   The full API response is saved to the `analysisResult` key in local storage.
    -   Displays an interactive satellite map with GeoTIFF data overlays (annual flux, etc.).
    -   Shows key metrics: viability score, max panel count, estimated savings.
    -   Presents detailed financial analysis and raw CRM data.
    -   A "Skip for now" button allows users to proceed to the next step.

-   **Step 4: Financial Details (`/financial-details`)**
    -   User provides their average monthly electricity bill via a slider.
    -   User provides their approximate credit score.
    -   User indicates their interest level (how soon they want to start).
    -   A disabled "Bill Upload" feature is present for future implementation.
    -   Data is saved to `financialData` in local storage.

-   **Step 5: Scheduling (`/scheduling`)**
    -   User selects a date and time for a consultation from a calendar.
    -   Data is saved to `appointmentData` in local storage.

-   **Step 6: Confirmation (`/confirmation`)**
    -   Displays a summary of all collected information from local storage.
    -   **Form Submission Trigger:** At this step, a script consolidates all data from local storage (`prospectData`, `addressData`, `analysisResult`, `financialData`, `appointmentData`) into a single JSON object.
    -   This object is sent programmatically via a `fetch` POST request to the Formspree endpoint.
    -   A success toast notification confirms the submission.
    -   User can choose to "Start Over", which clears all local storage keys and redirects to `/`.

---

### Journey B: The Other Services Path (HVAC, Roofing, Smart Home)

This flow is for users interested in non-solar services.

-   **Step 1: Landing Page (`/`)**
    -   User selects "HVAC", "Roofing", or "Smart Home".
    -   User fills out their contact information (same as solar).
    -   Data is saved to `prospectData` and `serviceChoice` in local storage.
    -   User is redirected to `/other-services`.

-   **Step 2: Other Services Details (`/other-services`)**
    -   User selects a "Service Type" from a dropdown (Installation, Maintenance, Repair, Estimate, Other).
    -   If "Other" is selected, a text area appears and is required for the user to describe their needs.
    -   Data is saved to `otherServicesData` in local storage.

-   **Step 3: Financial Details (`/financial-details`)**
    -   This is the same page as the solar path, but the "Monthly Bill" slider and "Bill Upload" sections are hidden.
    -   User provides their approximate credit score and interest level.
    -   Data is saved to `financialData` in local storage (without the `monthlyBill` field).

-   **Step 4: Scheduling (`/scheduling`)**
    -   Same as the solar path. User books a consultation.
    -   Data is saved to `appointmentData` in local storage.

-   **Step 5: Confirmation (`/confirmation`)**
    -   Displays a summary of all collected information.
    -   **Form Submission Trigger:** All data (`prospectData`, `otherServicesData`, `financialData`, `appointmentData`) is compiled and sent to the Formspree endpoint.
    -   A success toast notification confirms the submission.
    -   User can choose to "Start Over".

## 4. Key Technical Requirements

-   **Data Persistence:** All session data must be stored in the browser's local storage until final submission.
-   **Form Submission:** Forms should NOT use the standard HTML `action` attribute. Submission must be handled via a `fetch` POST request on the final confirmation page to prevent premature submission.
-   **Map Visualization:** The solar report map must correctly render GeoTIFF data layers fetched from the Solar API over the Google Maps satellite view. It should not get stuck in a "loading" state.
-   **Configuration:** All user-facing text, labels, and options should be managed centrally in `src/lib/config.ts` for easy customization.
-   **Error Handling:** API calls and form submissions should have robust error handling and provide clear feedback to the user via toast notifications.
