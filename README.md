# EveS - Event Booking Website

EveS is a modern event booking platform built with React and Supabase. It allows users to browse upcoming events, search events, view detailed event information, select seats, and book tickets securely. Admin users can manage events and users via a dedicated dashboard.

---

## Features

- User authentication with Supabase (email/password)
- Browse and search upcoming events with live filtering
- Detailed event pages with description, date/time, venue, and pricing
- Select number of tickets and specific seats from a seat map
- Real-time booking with seat selection validation
- User dashboard for managing bookings and wishlist
- Admin panel for managing events and users (admin users only)
- Accessible UI with tooltips, loading animations, and error handling

---

## Tech Stack

- React (with React Router)
- Supabase (PostgreSQL database, Authentication, Storage)
- React Hot Toast for notifications
- Font Awesome for icons
- CSS Modules and responsive styling

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- Supabase account with project and database setup

### Installation

1. Clone this repository:
Install dependencies:

bash
Copy
Edit
npm install
Configure environment variables:

Create a .env file in the project root with your Supabase credentials:

ini
Copy
Edit
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
Run the development server:

bash
Copy
Edit
npm run dev
Your app should be accessible at http://localhost:3000.
