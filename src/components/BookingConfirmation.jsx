import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBookingById } from "../api";
import ReviewForm from "./ReviewForm";

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        const data = await getBookingById(id);
        setBooking(data);
      } catch (err) {
        setError(err.message || "Failed to load booking.");
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="booking-confirmation-container">
        <div className="booking-confirmation">
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking || error) {
    return (
      <div className="booking-confirmation-container">
        <div className="booking-confirmation">
          <h2>Booking Not Found</h2>
          <p>{error || "No booking information available."}</p>
          <Link to="/bookings" className="link-button secondary">
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(booking.start_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const endDate = new Date(booking.end_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const days = Math.ceil(
    (new Date(booking.end_date) - new Date(booking.start_date)) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="booking-confirmation-container">
      <div className="booking-confirmation">
        <h1>Booking Confirmation</h1>

        <div className="confirmation-status">
          <span className={`status-badge ${booking.status}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        {booking.status === "pending" && (
          <p className="approval-notice">
            Your booking request has been submitted and is awaiting host approval.
            You will receive a notification once the host responds.
          </p>
        )}

        <div className="booking-details">
          <h2>Booking Details</h2>

          <div className="detail-row">
            <span className="label">Booking ID:</span>
            <span className="value">{booking.id.slice(0, 8)}...</span>
          </div>

          <div className="detail-row">
            <span className="label">Van:</span>
            <span className="value">{booking.vans?.name}</span>
          </div>

          <div className="detail-row">
            <span className="label">Start Date:</span>
            <span className="value">{startDate}</span>
          </div>

          <div className="detail-row">
            <span className="label">End Date:</span>
            <span className="value">{endDate}</span>
          </div>

          <div className="detail-row">
            <span className="label">Duration:</span>
            <span className="value">{days} day{days > 1 ? "s" : ""}</span>
          </div>

          <div className="detail-row total">
            <span className="label">Total Price:</span>
            <span className="value">${booking.total_price}</span>
          </div>

          {booking.cancellation_deadline && (
            <div className="detail-row cancellation">
              <span className="label">Cancellation Deadline:</span>
              <span className="value">
                {new Date(booking.cancellation_deadline).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
          )}
        </div>

        <div className="cancellation-policy">
          <h3>Cancellation Policy</h3>
          <ul>
            <li>
              Cancel 30+ days before rental: 10% fee
            </li>
            <li>
              Cancel 14-29 days before rental: 25% fee
            </li>
            <li>
              Cancel 7-13 days before rental: 50% fee
            </li>
            <li>
              Cancel less than 7 days before rental: No refund
            </li>
          </ul>
        </div>

        <div className="confirmation-actions">
          <Link to="/vans" className="button secondary">
            Browse More Vans
          </Link>
          <Link to="/bookings" className="button primary">
            View My Bookings
          </Link>
        </div>

        {booking.status === "completed" && booking.vans && (
          <div className="review-section">
            <ReviewForm booking={booking} van={booking.vans} />
          </div>
        )}
      </div>
    </div>
  );
}
