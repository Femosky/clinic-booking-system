# Klinic - A Clinic Appointment Booking and Management System

![GitHub stars](https://img.shields.io/github/stars/Femosky/clinic-booking-system.svg?style=social) ![License](https://img.shields.io/github/license/Femosky/clinic-booking-system.svg) ![Last Commit](https://img.shields.io/github/last-commit/Femosky/clinic-booking-system.svg)  

A clinic appointment booking platform built as a capstone project. Patients can view available time slots, book or cancel appointments, and administrators can manage slots and bookings—all powered by React, Tailwind CSS, and Firebase.

---

## 🚀 Live Demo

> **Website:** `http://clinic-booking-system-hazel.vercel.app/`  

---

## ✨ Features

- **User Authentication**
  - Firebase Authentication (email/password) allows patients and admins to securely log in or register.
  - Sign in with Google.

- **Appointment Slot Management**  
  - **Patients** browse a list of services by various clinics and view/choose from available appointment slots.  
  - **Admins** create, edit, or delete time slots via a protected admin panel.

- **Real-Time Booking Updates**  
  Firestore-powered reads/writes ensure that slot availability updates instantly as patients book or cancel.

- **Booking Workflow**  
  Patients provide their name, contact info, and any notes when booking. They can also view or cancel existing appointments.

- **Admin Dashboard**  
  Secure admin area to:  
  - Add new slots (date, time, doctor/department).  
  - Monitor upcoming bookings.  
  - Mark slots as “filled” or “canceled.”

- **Responsive Design**  
  Built with Tailwind CSS to work on desktop, tablet, and mobile devices.

- **Notifications**  
  Email confirmations for patients, doctors, and clinics upon booking.

---

## 🛠 Tech Stack

- **Frontend**  
  - React  
  - Tailwind CSS

- **Backend / Database**  
  - Firebase Realtime Database (NoSQL database for storing slots & bookings)  
  - Firebase Authentication (user registration & login)  

- **Deployment**  
  - Frontend hosted on Vercel
  - Firebase (Realtime Database, Auth)

---

## 📥 Quick Start

1. **Clone the repository**  
   ```bash
   git clone https://github.com/Femosky/clinic-booking-system.git
   cd clinic-booking-system
   
2. **Install NPM and all required dependencies**  
   ```bash
   npm install

3. **Create a Firebase Project**  
   - Log in to your Firebase console or create an account if you don't have one.
   - Navigate to your console, click `Create a Firebase Project`, and follow the creation process.

4. **Configure your firebase config**
   - In your Firebase console, click on the settings icon in the top left corner and click `Project Settings`.
   - Scroll to the `Your apps` section and copy the configuration code provided there.
   - Now, open and paste the configuration code you got from your Firebase project console settings in `firebase.js`. It is located in this directory: `src` -> `firebase` -> `firebase.js`. (You may only need to replace `firebaseConfig` with your own data if the file is already setup).
   - Make sure to add the following lines of code at the bottom of the file if it isn't available:
   
   ```bash
   export const auth = getAuth(app);
   export const provider = new GoogleAuthProvider();

5. **Run in development mode**
   
   ```bash
   npm run dev

---

## 📂 Project Structure

## 📂 Project Structure

| Path                                      | Description                                                       |
| ----------------------------------------- | ----------------------------------------------------------------- |
| **.github/**                              | GitHub configuration (workflows, issue templates, etc.)           |
| **node_modules/**                         | Installed npm dependencies                                        |
| **public/**                               | Static assets (HTML template, favicon, etc.)                      |
| **src/**                                  | Application source code                                           |
| ├── **assets/**                           | Images, icons, and other static media                              |
| ├── **components/**                       | Reusable React components (buttons, cards, modals, etc.)          |
| ├── **contexts/**                         | React Context providers (e.g., CartProvider.jsx, UserDataProvider.jsx) |
| ├── **firebase/**                         | Firebase configuration and initialization (firebase.js)           |
| ├── **global/**                           | Global styles or constants (theme settings, global CSS)           |
| ├── **hooks/**                            | Custom React hooks (data fetching, form handling, etc.)           |
| ├── **layouts/**                          | Layout components (e.g., header, footer, sidebar wrappers)       |
| ├── **pages/**                            | Page-level components (Home, Booking, Profile, Admin, etc.)       |
| ├── **services/**                         | API service modules (Firestore queries, authentication helpers)   |
| ├── **utils/**                            | Utility functions (date formatting, validation helpers, etc.)     |
| ├── App.css                               | Global CSS for App component                                       |
| ├── App.jsx                               | Root React component (defines routes and wraps providers)         |
| ├── index.css                             | Base CSS (resets or global element styles)                        |
| └── main.jsx                              | Application entry point (renders `<App />` into the DOM)          |
| **.gitignore**                            | Files and directories to ignore in Git                            |
| **eslint.config.js**                      | ESLint configuration                                              |
| **index.html**                            | HTML template served by Vite                                       |
| **package-lock.json**                     | Exact versions of installed npm packages                           |
| **package.json**                          | Project metadata, scripts, and dependencies                        |
| **README.md**                             | Project overview and setup instructions                            |
| **vercel.json**                           | Vercel deployment configuration                                    |
| **vite.config.js**                        | Vite build and dev server configuration                            |


---

## 📄 License

Distributed under the MIT License. See LICENSE for more details.

## ✉️ Contact

[Contact me here](https://femiojeyemi.com/contact)


