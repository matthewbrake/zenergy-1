# Solaris Navigator - File Structure Guide

This document provides an overview of the key files and directories in the Solaris Navigator project. Understanding the structure will help you make customizations and add new features more effectively.

## Root Directory

-   **`package.json`**: This is the heart of the Node.js project. It lists all the project dependencies (like React, Next.js, and Tailwind) and defines key scripts like `dev`, `build`, and `start`.
-   **`tailwind.config.ts`**: The configuration file for Tailwind CSS. This is where you can customize the design system, including fonts, spacing, and other visual properties.
-   **`next.config.ts`**: The configuration file for Next.js. It allows you to customize the behavior of the Next.js framework.
-   **`apphosting.yaml`**: Configuration for Firebase App Hosting, specifying that this is a Next.js application.
-   **`*.md` files** (`README.md`, `PRODUCT_GUIDE.md`, `DEPLOYMENT_GUIDE.md`): Markdown documents providing information about the project.

---

## `src` Directory

This is where the main application source code lives.

### `src/app/`

This directory uses the **Next.js App Router** paradigm. Each folder inside `src/app` represents a URL path in the application.

-   **`layout.tsx`**: The root layout for the entire application. It defines the main `<html>` and `<body>` tags and includes global components like the `Toaster` for notifications.
-   **`globals.css`**: The main stylesheet for the application. **This is where you can easily change the application's color scheme** by modifying the CSS variables at the top of the file.
-   **`/page.tsx`**: This is the **landing page** of the application (the page at the `/` URL). It contains the initial service selection and prospect information form.
-   **`/[page-name]/page.tsx`**: Each subfolder with a `page.tsx` file inside it corresponds to a page in the application. For example:
    -   `src/app/address-entry/page.tsx` -> `http://yourapp.com/address-entry`
    -   `src/app/solar-report/page.tsx` -> `http://yourapp.com/solar-report`
    -   `src/app/confirmation/page.tsx` -> `http://yourapp.com/confirmation`

### `src/components/`

This directory contains all the reusable React components used throughout the application.

-   **`ui/`**: This subfolder contains the core UI components from the **`shadcn/ui`** library (e.g., `Button.tsx`, `Card.tsx`, `Input.tsx`). These are the building blocks of the application's interface.
-   **`solar-navigator/`**: This contains custom components built specifically for this application, such as:
    -   `analysis-display.tsx`: The main component that orchestrates the display of the solar report.
    -   `map-view.tsx`: The component responsible for rendering the Google Map and its data overlays.
    -   `metric-card.tsx`: The small cards used to display key statistics on the solar report page.

### `src/lib/`

This directory holds the application's core logic, type definitions, and utility functions.

-   **`config.ts`**: **The master configuration file.** This is the most important file for customizing the user-facing content. You can change all page titles, button text, form labels, and the logo URL from this single file.
-   **`actions.ts`**: This file contains the **Next.js Server Actions**. The `getSolarAnalysis` function is defined here. This server-side code is responsible for securely calling the Google Solar API with your API key.
-   **`types.ts`**: Defines the data structures and TypeScript types used throughout the application, such as `ProspectData` and the various responses from the Solar API. This helps ensure data consistency.
-   **`geotiff-renderer.ts`**: A utility file containing functions specifically for rendering the GeoTIFF data from the Solar API onto the map canvas.
-   **`utils.ts`**: A small utility file from `shadcn/ui` used for merging Tailwind CSS classes.

### `src/hooks/`

This directory contains custom React Hooks.

-   **`use-local-storage.ts`**: A crucial hook that allows the application to save and retrieve data from the browser's local storage. This is how the app remembers user information between pages without submitting the form prematurely.
-   **`use-toast.ts`**: The hook that powers the notification system (toasts).
-   **`use-mobile.tsx`**: A hook for detecting if the user is on a mobile device.

---

## How It All Works Together (The User Journey)

1.  A user lands on **`src/app/page.tsx`**, fills out their info, and selects a service.
2.  The form data is saved to the browser's local storage using the **`useLocalStorage`** hook.
3.  The user is navigated to the next step (e.g., **`src/app/address-entry/page.tsx`**).
4.  Each subsequent page component reads the existing data from local storage and adds its own data upon completion.
5.  If the "Solar" path is chosen, the **`solar-report`** page calls the **`getSolarAnalysis`** server action from **`src/lib/actions.ts`**.
6.  This action securely calls the Google Solar API and returns the data.
7.  The **`map-view.tsx`** component uses the **`geotiff-renderer.ts`** utility to display the data on the map.
8.  Finally, on the **`confirmation`** page, a script gathers **all** the data from local storage and sends it in a single, complete package to the Formspree endpoint.
