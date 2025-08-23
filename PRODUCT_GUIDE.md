# Solaris Navigator - Product Guide

This document outlines the intended features, user flows, and data collection points for the Solaris Navigator application. It serves as a single source of truth for the app's functionality.

## 1. Core Objective

The primary goal of this application is to provide a comprehensive, API-driven sales funnel for various home services, with a special focus on solar energy analysis. It should capture lead information, provide value to the user (e.g., a solar report), and book a consultation.

## 2. User Journeys

The application has two main user journeys that start from the landing page.

### Journey A: The Solar Path

This flow is for users interested in a solar panel installation.

-   **Step 1: Landing Page (`/`)**
    -   User selects "Solar".
    -   User fills out their contact information: First Name, Last Name, Company, Phone, Email, and full property address (Street, State, Zip).
    -   Data collected: `prospectData` (object).
    -   Service choice stored: `serviceChoice` = 'Solar'.

-   **Step 2: Address Entry (`/address-entry`)**
    -   User confirms their address using Google Maps Autocomplete for high accuracy.
    -   A "Skip" button is available to bypass this step and the solar report.
    -   Data collected: `addressData` (object with lat/lng).

-   **Step 3: Solar Report (`/solar-report`)**
    -   If the address was confirmed, the app calls the Google Solar API.
    -   Displays an interactive satellite map with GeoTIFF data overlays (annual flux, etc.).
    -   Shows key metrics: viability score, max panel count, estimated savings.
    -   Presents detailed financial analysis and CRM data.
    -   A "Skip for now" button allows users to proceed without deep analysis.

-   **Step 4: Financial Details (`/financial-details`)**
    -   User provides their average monthly electricity bill.
    -   User provides their approximate credit score.
    -   User indicates their interest level (how soon they want to start).
    -   *Note: A disabled "Bill Upload" feature is present for future implementation.*
    -   Data collected: `financialData` (object).

-   **Step 5: Scheduling (`/scheduling`)**
    -   User selects a date and time for a consultation from a calendar.
    -   Data collected: `appointmentData` (object).

-   **Step 6: Confirmation (`/confirmation`)**
    -   Displays a summary of all collected information.
    -   **Form Submission Trigger:** At this step, all collected data from local storage (`prospectData`, `addressData`, `financialData`, `appointmentData`) is compiled and sent programmatically to the Formspree endpoint.
    -   A success toast notification confirms the submission.
    -   User can choose to "Start Over", which clears all data.

---

### Journey B: The Other Services Path (HVAC, Roofing, Smart Home)

This flow is for users interested in non-solar services.

-   **Step 1: Landing Page (`/`)**
    -   User selects "HVAC", "Roofing", or "Smart Home".
    -   User fills out their contact information (same as solar).
    -   Data collected: `prospectData`.
    -   Service choice stored: `serviceChoice` = 'HVAC', 'Roofing', etc.

-   **Step 2: Other Services Details (`/other-services`)**
    -   User selects a "Service Type" from a dropdown (Installation, Maintenance, Repair, Estimate, Other).
    -   If "Other" is selected, a text area appears and is required for the user to describe their needs.
    -   Data collected: `otherServicesData` (object).

-   **Step 3: Financial Details (`/financial-details`)**
    -   This is the same page as the solar path, but the "Monthly Bill" slider is hidden.
    -   User provides their approximate credit score and interest level.
    -   Data collected: `financialData` (object, but without the `monthlyBill` field).

-   **Step 4: Scheduling (`/scheduling`)**
    -   Same as the solar path. User books a consultation.
    -   Data collected: `appointmentData`.

-   **Step 5: Confirmation (`/confirmation`)**
    -   Displays a summary of all collected information.
    -   **Form Submission Trigger:** All data (`prospectData`, `otherServicesData`, `financialData`, `appointmentData`) is compiled and sent to Formspree.
    -   A success toast notification confirms the submission.
    -   User can choose to "Start Over".

## 3. Key Technical Requirements

-   **Data Persistence:** All data collected during a session must be stored in the browser's local storage until the final submission.
-   **Form Submission:** Forms should NOT use the standard HTML `action` attribute. Submission must be handled via JavaScript (`fetch` API) on the final confirmation page to prevent premature submission and user redirection.
-   **Map Visualization:** The solar report map must correctly render GeoTIFF data layers fetched from the Solar API over the Google Maps satellite view. It should not get stuck in a "loading" state.
-   **Configuration:** All user-facing text, labels, and options should be managed centrally in `src/lib/config.ts` for easy customization.
-   **Error Handling:** API calls and form submissions should have robust error handling and provide clear feedback to the user.
