# Times Global - Data Centre Management Suite
## Official Handover & Technical Documentation

**Version:** 1.0.0 (Handover Document)
**Last Updated:** 2024-07-26
**Original Author:** [Suman Paneru]

---

## 1. Executive Summary & Project Vision

### 1.1. Introduction & Purpose
This document provides a complete functional and technical overview of the **Times Global Data Centre Management Suite**. This application is an enterprise-level, internal tool designed to digitize, centralize, and streamline the critical operational workflows of Times Global's data center facilities.

The primary business goal of this software is to replace inefficient, error-prone manual paper trails with a secure, reliable, and scalable digital solution. It enhances security by creating verifiable audit trails, improves operational efficiency by automating data entry and retrieval, and provides management with valuable data-driven insights.

### 1.2. Scope & Boundaries
The application's scope is centered around four primary operational domains:

1.  **Visitor Management System (VMS):** Tracking the full lifecycle of a person's visit, from check-in to check-out.
2.  **Equipment Logistics (Forms):** Managing the physical movement of assets into (Device Storage) and out of (Gate Pass) the data center.
3.  **Task Management System:** Assigning, tracking, and reporting on internal and client-related jobs within the facility.
4.  **Identity & Image Registry:** A foundational module that maintains a central database of individuals (staff, contractors, frequent visitors) and their photographs to accelerate identification and data entry across the application.

The system is architected from the ground up to be **multi-location aware**, ensuring that data is securely segregated and managed on a per-site basis.

### 1.3. Target Audience for this Document
This document is a comprehensive guide intended for:
-   **End-Users (Operators, Staff):** See **Section 2** for a step-by-step guide on how to use the application's features.
-   **System Administrators:** See **Section 3** for managing users and locations.
-   **Developers (New & Existing):** See **Section 4** for a deep dive into the architecture, code, and technical concepts.
-   **Project Managers:** The entire document, particularly Sections 1, 5, and 6, can be used to understand system capabilities and plan future work.

### 1.4. Key Terminology / Glossary
-   **VMS:** Visitor Management System. The module for handling visitor logs.
-   **Device Storage:** The process and form used to log equipment being brought *into* the facility for storage.
-   **Gate Pass:** The process and form used to authorize equipment being taken *out of* the facility.
-   **JWT:** JSON Web Token. The technology used for secure user authentication.
-   **SPA:** Single-Page Application. The application runs entirely in the browser after the initial load, providing a fast, fluid user experience.
-   **Location:** Refers to a physical Times Global data center site (e.g., Kathmandu, Butwal).
-   **User Registry / Image Registry:** The central database of people and their photos, used for auto-fill features.

---

## 2. For the End-User: A Functional Guide

This section explains how to use the application for daily tasks.

### 2.1. Getting Started: Login & Location Selection
1.  **Login:** Open the application URL and enter your company email address (as the username) and password.
2.  **First-Time Login / Issues:**
    -   If you see a "Pending Approval" page, it means an administrator has not yet activated your account. Please contact them.
    -   If you see a "No Locations Assigned" page, your account is active, but you don't have permission for any data center site. An administrator must assign you to one or more locations.
3.  **Location Selection:** If you have access to more than one data center, you will be prompted to select a location. This choice determines where all your data (visitor check-ins, tasks, etc.) will be recorded for your current session. You can switch between your authorized locations at any time from the Main Dashboard header.

### 2.2. The Main Dashboard
This is the central hub. From here, you can:
-   See your `username` and currently active `Location`.
-   Switch locations if you have more than one.
-   Navigate to any of the main modules by clicking on its card (e.g., "Visitor Management System").
-   `Logout` of the application.

### 2.3. Using the Visitor Management System (VMS)
Navigate here by clicking the "Visitor Management System" card on the main dashboard.

-   **VMS Home:** The main page shows you three important live statistics for your selected location: Total Visitors Today, Unexited Visitors, and Exited Visitors.
-   **Registering a User/Image (`Register User`):** This is the most important preparatory step.
    -   Use this page to add new employees, frequent visitors, or contractors to the system.
    -   Fill in their `Full Name`, `Contact`, `Email`, and `ID Type`, and upload a clear photograph.
    -   Keeping this registry up-to-date makes the "Add Record" process much faster.
    -   You can also search, edit, and delete existing records from this page.
-   **Adding a Visitor (`Add Record`):**
    1.  In the `Full Name` field, start typing the visitor's name.
    2.  When you tab or click out of the field, the system will search the User Registry.
    3.  **If the user is found,** their registered `Full Name`, `ID Type`, `Contact`, and `Email` will be filled in for you automatically. You will see a green confirmation message.
    4.  **If the user is not found,** you will see a yellow warning message. You can proceed by filling in all their details manually.
    5.  Complete the remaining fields (`Reason`, `Approved By`, etc.) and click "Check In".
-   **Managing Visitors (`Visitor List`):**
    -   **Today's Visitors:** This top table shows everyone who has checked in today.
    -   **Search Visitor Log:** This bottom section allows you to find historical records by date range or by name.
    -   **Actions:**
        -   `View`: Opens a popup showing the complete visit history for that specific person.
        -   `Check-Out`: Click this to record the visitor's exit time. The button will disappear, and the `Check-Out Time` will be updated.
-   **Generating Reports (`Reports`):** Select a start and end date to generate a downloadable/printable list of all visitor activity within that period.

### 2.4. Handling Equipment: Forms & Printing

-   **Device Storage Form:** Use this when a client or staff member is leaving equipment at the data center.
    1.  Fill out the company and date information.
    2.  Use the "ADD ITEM ROW" button to add as many lines as you need for each piece of equipment.
    3.  Fill in the submitter's details. Your name will be auto-filled in the "Prepared By" field.
    4.  Click **SAVE & GENERATE RECEIPT**.
-   **Gate Pass Form:** Use this to authorize equipment *leaving* the data center.
    1.  Fill in the recipient's details and the pass date.
    2.  Add all items being taken out.
    3.  Fill in the approval names.
    4.  Click **SAVE & GENERATE PASS**.
-   **The Print Workflow:**
    -   After clicking "SAVE & GENERATE," you are taken to a **Print Preview** screen.
    -   From here, you can click `Print` to print the official document. The Gate Pass is special and will print two slips on one A4 page.
    -   You can also click `Edit` to return to the form and make corrections, or `Create New` to start over.
-   **Viewing Previous Records:**
    -   On either form, click the `View Previous...` button to see a list of all past records for your location.
    -   From this popup, you can `View` a record to load its data into the form for editing, or `Reprint` it to go directly to the print preview screen.

### 2.5. Managing Work: The Task Management Module

-   **Adding a Task (`Add Task`):**
    -   This form is for logging jobs or activities that need to be done.
    -   Like the VMS, the `Full Name` field will look up the person in the User Registry and attempt to auto-fill their `Contact` number.
    -   Your name is pre-filled as the "Encoded By".
-   **The Task List (`Task List`):**
    -   This page is split into two sections for clarity:
        1.  **Tasks from Recent 24 Hours:** Shows the most current work.
        2.  **All Tasks:** A complete historical list.
    -   Tasks are marked as `Pending` or `Completed`.
-   **Editing & Completing Tasks:**
    -   Click the `Edit` button on any task to open a popup.
    -   Here you can change any detail or, most importantly, check the "Task Completed" box to resolve it.
-   **Task Reports (`Reports`):** Select a date range to get a list of all tasks scheduled within that period.

---

## 3. For the Administrator: System Management

### 3.1. User Account Management
User management is a critical administrative function handled in the **backend system's admin panel**, not within this frontend application.
1.  **New User Registers:** A new user creates an account via the "Register" page.
2.  **Administrator Approval:** You, the Administrator, must log in to the backend admin interface (e.g., `http://192.168.55.83:8000/admin/`). Navigate to the Users section and find the new user. You must explicitly mark their account as "approved".
3.  **Location Assignment:** While approving the user, you must also assign them to one or more `Locations`. If a user is not assigned to any location, they will be unable to use the application.

### 3.2. Location Management
The list of available data center locations (`Kathmandu`, `Butwal`, etc.) is also managed directly in the backend database. To add, remove, or rename a location, you must make changes in the backend `Locations` table.

### 3.3. Troubleshooting Common User Issues
-   **User says, "My account is pending approval."**
    -   **Cause:** You have not yet approved their account in the backend admin panel.
    -   **Solution:** Log in to the backend and approve their user account.
-   **User says, "I'm approved, but it says I have no locations."**
    -   **Cause:** You have not assigned any locations to their user profile in the backend.
    -   **Solution:** Log in to the backend, find their user profile, and associate them with the correct data center location(s).
-   **User says, "The app isn't loading data for my location."**
    -   **Cause:** The frontend might not be able to connect to the backend API, or the backend service might be down.
    -   **Solution:** Verify the backend server is running and accessible from the user's network. Check the browser's developer console for network errors.

---

## 4. For the Developer: Technical Deep Dive

### 4.1. Technical Stack

#### Frontend
-   **Framework:** React 19 (using hooks) with TypeScript
-   **Bundler & Dev Server:** Vite
-   **Routing:** React Router v6 (`HashRouter`)
-   **Styling:** Tailwind CSS (via CDN) and custom print stylesheets.
-   **Live JSX Transpilation:** Babel Standalone (loaded in `index.html`). **Note:** This is a development-friendly setup. For a production-optimized build, a standard Vite build process that pre-compiles JSX is recommended.
-   **API Communication:** Native `fetch` API wrapped in a custom service.

#### Backend
-   **Framework:** Django
-   **API:** Django REST Framework
-   **Authentication:** Simple JWT (JSON Web Tokens) via `rest_framework_simplejwt`
-   **Database:** PostgreSQL (primary), SQLite (for development)
-   **CORS Handling:** `django-cors-headers`
-   **Filtering:** `django-filters`

### 4.2. Project Structure
```
/
├── public/
│   ├── images/                 # Static images and logos
│   ├── device_storage_print.css # Print styles for Device Storage
│   └── gatepass_print.css       # Print styles for Gate Pass
├── components/
│   ├── auth/                   # Pages for auth edge cases (Pending, No Locations)
│   ├── common/                 # Reusable components (Button, Input, Card)
│   ├── forms/                  # Device Storage & Gate Pass modules
│   ├── task-management/        # Task Management module
│   └── vms/                    # Visitor Management module
├── services/
│   ├── apiService.ts           # Central API communication hub
│   └── tokenService.ts         # localStorage utilities for tokens
├── App.tsx                     # Main application router
├── index.html                  # Entry point, loads scripts and styles
├── index.tsx                   # React root renderer
├── vite.config.ts              # Vite configuration (CSP, server settings)
└── README.md                   # This document
```

### 4.3. Architecture
The application is a **decoupled Single-Page Application (SPA)**.

-   **Frontend:** The React application is responsible for all UI rendering and state management. It is a "dumb" client that relies entirely on the backend for data and business logic. The use of **Babel Standalone** in `index.html` means JSX is transpiled in the browser at runtime. This is convenient for rapid development but should be replaced by a standard Vite build process for production to improve performance.
-   **Backend:** A Django/Python server exposes a RESTful API. It handles all business logic, database interactions, and user authentication.

### 4.4. Core Subsystems In-Depth

#### 4.4.1. Routing (`App.tsx`)
-   **`HashRouter`:** Chosen for its robustness in static hosting environments. It uses the URL hash (`#`) to manage routes, which avoids the need for server-side configuration to handle client-side routing.
-   **`ProtectedRoute`:** This is the application's security gatekeeper. Before rendering any protected page, it checks the global `LocationContext` state in a strict order:
    1.  Is the user authenticated? (`isAuthenticated`) -> If not, redirect to `/login`.
    2.  Is their account approved? (`isApprovedByAdmin`) -> If not, redirect to `/pending-approval`.
    3.  Do they have any locations assigned? (`authorizedLocations`) -> If not, redirect to `/no-locations-assigned`.
    4.  Have they selected a location for this session? (`selectedLocation`) -> If not, and they have multiple options, redirect to `/select-location`.
-   **Nested Routes:** The VMS and Task Management modules utilize nested routing with an `<Outlet />`. This allows them to share a common layout component (`VMSDashboardLayout`, `TaskManagementDashboardLayout`) which provides the sidebar and header, while the main content area is dynamically rendered.

#### 4.4.2. State Management (`LocationContext.tsx`)
This context is the **single source of truth for session state**.
-   **State Provided:** `isAuthenticated`, `isApprovedByAdmin`, `authorizedLocations`, `selectedLocation`, `username`, `isLoadingAuth`.
-   **Hydration & Persistence:** On initial load, the `loadAuthData` function runs. It checks `localStorage` for authentication tokens and user details (`username`, `isApprovedByAdmin`, etc.) and "hydrates" the React state. This makes the session persistent.
-   **Auto-Selection Logic:** The context contains logic to automatically select a location if a user is only authorized for one, streamlining the login process for the majority of users.
-   **Single Point of Mutation:** The `login` and `logout` functions are the only ways to change authentication state, ensuring all `localStorage` and React state updates happen predictably and consistently.

#### 4.4.3. API Service (`apiService.ts`)
This is the most critical service for backend communication.
-   **Automatic Token Refresh:** This service intercepts `401 Unauthorized` errors. It uses a flag (`isRefreshing`) and a queue (`failedQueue`) to handle token refreshes gracefully. When a 401 occurs:
    1.  The `isRefreshing` flag is set to `true`.
    2.  The service requests a new access token using the refresh token.
    3.  All other API calls that fail with a 401 during this time are added to the `failedQueue`.
    4.  Once the new token is received, the queue is processed, and all failed requests are retried with the new token. This is invisible to the user.
-   **Automatic Location Scoping:** The `endpointNeedsLocationForGET` helper identifies which `GET` requests require filtering by location. The service automatically reads the `selectedLocation` from `localStorage` and appends `?location_id=<id>` to the request URL, ensuring the backend returns only relevant data.
-   **Automatic Pagination (`getAll`):** This powerful helper method abstracts away backend pagination. It makes an initial request, and if the response contains a `next` URL, it continues to call that URL until all pages have been fetched, concatenating the `results` into a single, complete array. This is vital for showing complete lists and reports.

#### 4.4.4. The Printing Subsystem
This is a carefully crafted system to produce high-quality physical documents.
1.  **Printable React Components:** `PrintableDeviceStorage.tsx` and `PrintableGatePass.tsx` are React components styled with Tailwind for the on-screen preview. They accept data as props.
2.  **Dedicated Print Stylesheets:** `device_storage_print.css` and `gatepass_print.css` contain `@media print` rules. These are the key to the system.
3.  **The Print Trigger Logic:**
    -   When `window.print()` is called, the browser switches to print mode, activating the `@media print` rules.
    -   JavaScript adds a class (e.g., `gate-pass-active-print`) to the `<body>` tag.
    -   The print CSS uses this body class to scope its rules (e.g., `body.gate-pass-active-print * { visibility: hidden; }`). This ensures that Device Storage print styles don't interfere with Gate Pass printing, and vice-versa.
    -   The rules hide everything on the page, then selectively make the `printable-area` and its children visible again, applying precise, print-friendly styles (e.g., `font-size: 9pt`, `width: 190mm`).

### 4.5. Key Component Logic

-   **`VMSUserRegistrationPage.tsx`:** Manages full CRUD for the User Registry. It uses `FormData` to handle image file uploads. The "Edit" functionality is handled within a modal, which gets its initial state from the user record that was clicked.
-   **`VMSVisitorListPage.tsx`:** Features the `enrichVisitorsWithImages` async function. This function takes a list of visitor logs, and for each visitor, it makes a separate API call to the `/images/` endpoint to find their photo. This decouples the visitor log from the image registry and is a good example of data composition on the frontend.
-   **`DeviceStorageForm.tsx` & `GatePassForm.tsx`:** These components manage their state to handle both creating new records and editing existing ones. The `editingRecordId` state variable is the key. If it's `null`, the form is in "new entry" mode. If it has an ID, it's in "edit" mode, and the submit buttons change accordingly.

### 4.6. Local Development & Deployment

#### Backend Setup (First Time)
1.  **Prerequisites:** Python 3.8+, PostgreSQL (or SQLite for simplicity).
2.  **Setup Virtual Environment:** From the project root, create and activate a virtual environment.
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Environment:** The `settings.py` file is configured to read from environment variables. You can create a `.env` file in the root and use a library like `python-dotenv` if you modify `manage.py`, or set them manually. Key variables are:
    -   `DJANGO_SECRET_KEY`
    -   `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
5.  **Run Migrations:** Apply the database schema.
    ```bash
    python manage.py migrate
    ```
6.  **Create Superuser:** Create your administrator account.
    ```bash
    python manage.py createsuperuser
    ```
7.  **Run Backend Server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will now be running, typically at `http://127.0.0.1:8000`.

#### Frontend Development
1.  **Prerequisites:** Node.js (v18 or later), npm or yarn.
2.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Configure API Backend URL:**
    -   Open `services/apiService.ts`.
    -   Modify the `BASE_URL` constant to point to your local or staging backend server (e.g., `http://127.0.0.1:8000/api`).
5.  **Configure Content Security Policy (CSP):**
    -   Open `vite.config.ts`.
    -   In the `cspDirectives` string, update the `connect-src` and `img-src` values to match the `BASE_URL` you configured.
6.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

#### Production Deployment
1.  **Build the Application:**
    ```bash
    npm run build
    ```
    This command will create a `dist/` directory containing optimized, static HTML, CSS, and JavaScript files.
2.  **Deploy:**
    -   Upload the **contents** of the `dist/` directory to any static file hosting service (e.g., Vercel, Netlify, AWS S3, a traditional web server like Nginx).
    -   No special server-side routing configuration is needed due to the use of `HashRouter`.

---

## 5. Future Roadmap & Potential Improvements

### For Product Owners & Managers
-   **Advanced Analytics Dashboard:** Integrate a charting library (like Chart.js) to create a visual dashboard for visitor traffic patterns, peak hours, task completion rates, etc.
-   **Real-time Notifications:** Implement WebSockets to push real-time alerts to the dashboard, such as for a high-priority visitor check-in or an overdue task.
-   **Full Inventory Management:** Expand the current "Device Storage" feature into a complete inventory management system, tracking asset history, ownership, and maintenance schedules.
-   **Audit Logs:** Introduce a comprehensive, user-facing audit trail to see a history of all major actions performed in the system for enhanced security and accountability.

### For Developers
-   **Refactor to a Pre-compiled Build:** Remove the dependency on Babel Standalone by migrating the `index.html` script tag to a standard Vite setup. This will improve initial load performance by serving pre-compiled JavaScript.
-   **Introduce a Global State Manager:** For more complex future features, consider migrating from `useContext` to a more robust state management library like **Redux Toolkit** or **Zustand**. This would provide better dev-tools and more scalable state management.
-   **Enhance Test Coverage:** Implement a testing strategy using **Jest** and **React Testing Library** to create unit and integration tests for critical components and services, especially `apiService.ts` and the authentication flow.
-   **Component Library:** Formalize the `components/common` directory into a storybook, making it easier to visualize, test, and document reusable UI components.

---

## 6. Final Handover Note

This application has been a significant undertaking, designed to be both robust and maintainable. The architecture was chosen to be as straightforward as possible while handling the complexities of authentication, permissions, and asynchronous data fetching. The core of the application's logic resides in `App.tsx` (routing/auth-gating), `LocationContext.tsx` (state), and `apiService.ts` (backend communication). Understanding these three files is the key to understanding the entire application.

I have done my best to provide a solid foundation. I trust that with this documentation, the new team will be well-equipped to maintain, enhance, and continue to extract value from this system for Times Global.
