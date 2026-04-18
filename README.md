# VanLife

A full-featured van rental platform with user authentication, booking management, payment processing, and host management capabilities.

## Features

### User Features
- Browse and filter vans by type (simple, rugged, luxury)
- View detailed van information
- Book vans with date selection
- Stripe payment integration
- View booking history
- Cancel bookings (with 7-day advance policy)

### Host Features
- Dashboard with income and reviews overview
- Manage van listings
- Add new vans with image upload
- Edit van details, pricing, and photos
- View and manage booking requests
- Approve or reject bookings
- Track booking status

### Technical Features
- Supabase authentication
- Supabase PostgreSQL database
- Supabase Storage for image uploads
- Row-Level Security (RLS) policies
- React Router for navigation
- Stripe payment processing
- Express.js backend for payment intents
- Client-side caching
- Lazy loading for performance

## Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Supabase JS Client
- Stripe React

### Backend
- Express.js
- Stripe API

### Database & Storage
- Supabase PostgreSQL
- Supabase Storage

## Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd vanlife
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

4. Set up Supabase

- Create a new Supabase project
- Run the SQL migration script to create tables
- Set up Row-Level Security (RLS) policies
- Create a public storage bucket named `van-images`

5. Start the development server
```bash
npm run dev
```

6. Start the backend server (in a separate terminal)
```bash
cd server
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:3001`.

## Database Schema

### Tables

**vans**
- id (integer, primary key)
- name (text)
- type (text: simple, rugged, luxury)
- price (numeric)
- description (text)
- imageUrl (text)
- host_id (text)
- created_at (timestamp)
- updated_at (timestamp)

**bookings**
- id (uuid, primary key)
- van_id (integer, foreign key)
- user_id (text)
- start_date (date)
- end_date (date)
- total_price (numeric)
- status (text: pending, confirmed, rejected, cancelled, completed)
- payment_intent_id (text)
- created_at (timestamp)
- updated_at (timestamp)

### Storage

**van-images** bucket
- Public bucket for van images
- Organized by user ID folders

## API Functions

### Van Operations
- `getVans()` - Fetch all vans
- `getVanById(id)` - Fetch a single van
- `getHostVans()` - Fetch vans for the current host
- `createVan(vanData)` - Create a new van
- `updateVan(vanId, updates)` - Update van details
- `deleteVan(vanId)` - Delete a van

### Image Operations
- `uploadVanImage(file, userId)` - Upload van image to Supabase Storage
- `deleteVanImage(filePath)` - Delete van image from Supabase Storage

### Booking Operations
- `getBookingsByUserId(userId)` - Fetch user's bookings
- `getBookingsByHostId(hostId)` - Fetch host's bookings
- `getBookingById(bookingId)` - Fetch a single booking
- `createBooking(bookingData)` - Create a new booking
- `updateBookingStatus(bookingId, status)` - Update booking status
- `cancelBooking(bookingId)` - Cancel a booking
- `checkVanAvailability(vanId, startDate, endDate)` - Check van availability

### Authentication
- `login(email, password)` - User login
- `logout()` - User logout
- `requireAuth()` - Authentication check for protected routes

## Project Structure

```
vanlife/
├── src/
│   ├── api.js                 # API functions
│   ├── components/            # Reusable components
│   │   └── ImageUploader.jsx
│   ├── lib/
│   │   └── supabase.js        # Supabase client
│   ├── pages/
│   │   ├── Host/              # Host pages
│   │   ├── Vans/              # Van listing pages
│   │   ├── About.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   └── UserBookings.jsx
│   ├── utils.js               # Utility functions
│   ├── App.jsx                # Main app with routes
│   └── index.css              # Global styles
├── server/
│   ├── index.js               # Express backend server
│   └── package.json
└── README.md
```

## Booking Flow

1. User selects van and dates
2. User fills booking form
3. Stripe payment intent is created
4. User completes payment via Stripe Elements
5. Booking is created with "pending" status
6. Host receives booking request
7. Host approves or rejects booking
8. If approved, booking status changes to "confirmed"
9. User can cancel booking up to 7 days before start date

## Development Notes

- The project uses a demo host ID system for testing
- RLS policies are set to be permissive for development
- Image uploads are limited to 5MB
- Supported image formats: JPEG, PNG, WebP
- Caching is implemented for van data to reduce API calls

## Future Enhancements

- Van editing and deletion
- Advanced search and filtering
- User and host profiles
- Review submission system
- Booking modification
- Calendar availability view
- Email notifications
- Unit tests
- TypeScript migration
