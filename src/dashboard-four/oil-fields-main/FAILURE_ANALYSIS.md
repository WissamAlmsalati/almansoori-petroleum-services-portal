
# Failure Analysis Checklists

This document provides two checklists for further manual testing: a security checklist for a human penetration tester and a usability "chaos" checklist to identify UI/UX breaking points.

---

## 1. Security Penetration Testing Checklist

This checklist is intended for a security professional to guide a manual penetration test against the application once it has a live backend.

### **Authentication & Session Management**
- [ ] Can session tokens be predicted or easily guessed?
- [ ] Are tokens securely transmitted (e.g., HTTPS only)?
- [ ] Does the "logout" functionality properly invalidate the session token on the backend, or does it just remove it from the client?
- [ ] Can a token be replayed indefinitely? Is there a reasonable expiration time?
- [ ] Is there any rate limiting on the login endpoint to prevent brute-force attacks?

### **Authorization & Access Control**
- [ ] **Insecure Direct Object Reference (IDOR):**
    - [ ] Log in as an `Employee`. Can you access another employee's profile by changing the ID in the URL (`/employees/emp-X`) and observing the network response, even if the UI redirects?
    - [ ] Log in as a `Supervisor`. Can you call an Admin-only API endpoint directly (e.g., `/api/settings/permissions`) and get a successful response?
    - [ ] Can a user change their own role by manipulating the payload in a profile update request?
- [ ] **Privilege Escalation:**
    - [ ] Can a `Coordinator` assign a schedule to a crew they are not authorized to manage?
    - [ ] Can an `Employee` approve their own shift swap or time-off request by manipulating an API call?

### **Input Validation & Data Sanitization**
- [ ] **Cross-Site Scripting (XSS):**
    - [ ] In the Digital Handover module, can you submit a note containing `<script>alert('XSS')</script>`? Is this script executed when another user views the handover?
    - [ ] Can an employee's name, address, or other profile fields be updated to include HTML or script tags? Is this rendered unsanitized anywhere in the application (e.g., dashboard alerts, user lists)?
- [ ] **CSV Injection:**
    - [ ] Can an employee's name be set to a formula like `=SUM(1+1)`? Does this get executed when the exported CSV is opened in a spreadsheet program?
    - [ ] Can a field be set to contain commas and quotes to break the structure of the exported CSV file?

### **API & Data Exposure**
- [ ] Does the API endpoint for `/api/employees` return all employee data (including sensitive info) to every role, with the client-side being responsible for filtering? Or does the API correctly scope the data based on the user's role?
- [ ] Are error messages verbose? Do they leak information about the backend stack, database structure, or internal file paths?

---

## 2. Usability "Chaos" Checklist

This checklist contains non-standard user actions designed to test the UI's resilience and uncover bugs or poor user experiences.

- [ ] **Rapid Form Submission:**
    - Action: Quickly click a "Save" or "Submit" button (e.g., Add New Employee, Submit Handover) multiple times before the API response returns.
    - Expected Result: The button should be disabled after the first click, and only one API request should be sent.
    - Potential Failure: Multiple duplicate records are created. The UI enters a broken state.

- [ ] **Browser Navigation During Modal Flow:**
    - Action: Open a modal (e.g., Add Course Record). Without closing the modal, use the browser's "Back" button. Then, use the "Forward" button to return.
    - Expected Result: The app state should remain consistent. The modal should either be gone or still be present and functional. The URL and application state should not be desynchronized.
    - Potential Failure: The modal overlay remains, but the modal content disappears, blocking the UI. The app crashes.

- [ ] **Invalid Data Entry:**
    - Action: In a date field, type text (e.g., "hello world"). In a number field (e.g., Bonus Rate), type letters.
    - Expected Result: The component should handle the invalid input gracefully, either by preventing it or showing a clear validation error. The app should not crash.
    - Potential Failure: `NaN` appears in the UI. The component crashes with a `TypeError`.

- [ ] **Stale Data Confirmation:**
    - Action: As an Admin, open two browser tabs to the Settings page. In Tab 1, change a permission. In Tab 2 (which now has stale data), change a different permission and click "Save".
    - Expected Result: The system should ideally detect the stale data (using ETags or a versioning system) and prompt the user. At a minimum, the last save should "win" without corrupting the overall settings object.
    - Potential Failure: The settings object becomes corrupted, merging the two conflicting states incorrectly.

- [ ] **Empty Form Submission (Bypass Validation):**
    - Action: Use browser developer tools to manually re-enable a "Submit" button that is disabled by client-side validation. Submit the empty or partially filled form.
    - Expected Result: The backend API should reject the request with a clear 400-level error, and the UI should display this error to the user.
    - Potential Failure: The backend creates a record with null or invalid data. The UI crashes on the success callback because it expects data that doesn't exist.

- [ ] **Rapid Window Resizing:**
    - Action: On a page with complex charts or grids (e.g., Reports, Scheduler), rapidly resize the browser window from wide to narrow and back again.
    - Expected Result: The layout should adjust smoothly without visual glitches or components overlapping.
    - Potential Failure: Charts re-render incorrectly. The CSS grid breaks. The application becomes sluggish or freezes.
