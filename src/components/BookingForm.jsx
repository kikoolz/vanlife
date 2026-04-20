import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking, checkAvailability, createPaymentIntent as createPaymentIntentAPI } from "../api";
import { supabase } from "../lib/supabase";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function BookingFormContent({ van }) {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const minDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days * van.price;
  };

  const validateDates = () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const minAllowedDate = new Date(minDate);

    if (start < minAllowedDate) {
      setError("Booking must be at least 7 days in advance.");
      return false;
    }

    if (end <= start) {
      setError("End date must be after start date.");
      return false;
    }

    setError("");
    return true;
  };

  const handleCheckAvailability = async () => {
    if (!validateDates()) return;

    setIsChecking(true);
    setAvailability(null);

    try {
      const result = await checkAvailability(van.id, startDate, endDate);
      setAvailability(result);
      if (!result.available) {
        setError("This van is not available for the selected dates.");
      } else {
        setError("");
      }
    } catch (err) {
      setError(err.message || "Failed to check availability.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!availability?.available) {
      setError("Please check availability before booking.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const totalPrice = calculateTotalPrice();
      const paymentIntent = await createPaymentIntentAPI(totalPrice);
      setClientSecret(paymentIntent.clientSecret);
      setPaymentIntentId(paymentIntent.id);
      setShowPaymentForm(true);
    } catch (err) {
      setError(err.message || "Failed to initialize payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe has not loaded. Please refresh the page.");
      return;
    }

    setIsProcessingPayment(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Please log in to book a van.");
        navigate("/login");
        return;
      }

      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setError(error.message || "Payment failed.");
        return;
      }

      if (confirmedPaymentIntent.status === "succeeded") {
        const totalPrice = calculateTotalPrice();
        const bookingData = {
          vanId: van.id,
          userId: user.id,
          hostId: van.host_id,
          startDate,
          endDate,
          totalPrice,
          paymentIntentId: confirmedPaymentIntent.id,
        };

        const booking = await createBooking(bookingData);
        navigate(`/bookings/${booking.id}/confirmation`);
      }
    } catch (err) {
      setError(err.message || "Failed to process booking.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const totalPrice = calculateTotalPrice();
  const days = startDate && endDate 
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="booking-form-container">
      <h3>Book this van</h3>
      <p className="van-price">
        <span>${van.price}</span>/day
      </p>

      {!showPaymentForm ? (
        <form onSubmit={(e) => { e.preventDefault(); handleProceedToPayment(); }} className="booking-form">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setAvailability(null);
                setError("");
              }}
              min={minDate}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setAvailability(null);
                setError("");
              }}
              min={startDate || minDate}
              required
            />
          </div>

          {days > 0 && (
            <div className="booking-summary">
              <p>
                <strong>{days} day{days > 1 ? "s" : ""}</strong> × ${van.price}/day
              </p>
              <p className="total-price">
                Total: <strong>${totalPrice}</strong>
              </p>
            </div>
          )}

          {startDate && endDate && !availability && (
            <button
              type="button"
              onClick={handleCheckAvailability}
              disabled={isChecking}
              className="link-button check-availability-button"
            >
              {isChecking ? "Checking..." : "Check Availability"}
            </button>
          )}

          {availability && (
            <div className={`availability-status ${availability.available ? "available" : "unavailable"}`}>
              {availability.available ? (
                <p>✓ Available for selected dates</p>
              ) : (
                <p>✗ Not available for selected dates</p>
              )}
            </div>
          )}

          {availability?.available && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="link-button book-button"
            >
              {isSubmitting ? "Initializing Payment..." : "Proceed to Payment"}
            </button>
          )}

          {error && <div className="error-message red">{error}</div>}

          <p className="booking-notice">
            * Bookings require host approval. Cancellation fees apply.
          </p>
        </form>
      ) : (
        <form onSubmit={handlePayment} className="booking-form">
          <div className="booking-summary">
            <p>
              <strong>{days} day{days > 1 ? "s" : ""}</strong> × ${van.price}/day
            </p>
            <p className="total-price">
              Total: <strong>${totalPrice}</strong>
            </p>
          </div>

          <div className="form-group">
            <label>Card Details</label>
            <div className="stripe-card-element">
              <CardElement />
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessingPayment || !stripe}
            className="link-button book-button"
          >
            {isProcessingPayment ? "Processing Payment..." : `Pay $${totalPrice}`}
          </button>

          <button
            type="button"
            onClick={() => setShowPaymentForm(false)}
            disabled={isProcessingPayment}
            className="link-button secondary"
          >
            Back
          </button>

          {error && <div className="error-message red">{error}</div>}

          <p className="booking-notice">
            * Your payment will be processed securely by Stripe.
          </p>
        </form>
      )}
    </div>
  );
}

export default function BookingForm({ van }) {
  return (
    <Elements stripe={stripePromise}>
      <BookingFormContent van={van} />
    </Elements>
  );
}
