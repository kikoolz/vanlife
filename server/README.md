# Vanlife Backend Server

This is the backend server for the Vanlife booking system with Stripe payment integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
The `.env` file is already configured with your Stripe test keys.

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm dev
```

## API Endpoints

### POST /api/create-payment-intent
Creates a Stripe payment intent for processing payments.

**Request:**
```json
{
  "amount": 100.00,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_...",
  "id": "pi_..."
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Environment Variables

- `STRIPE_SECRET_KEY`: Your Stripe secret key (test or live)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## Notes

- The server runs on port 3001 by default
- Make sure the server is running before making booking requests from the frontend
- The frontend is configured to call `http://localhost:3001/api/create-payment-intent`
