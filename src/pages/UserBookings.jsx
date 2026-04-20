import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserBookings, cancelBooking, updateBookingDates } from "../api";
import { supabase } from "../lib/supabase";
import { SkeletonBookingCard } from "../components/Skeleton";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showEditDates, setShowEditDates] = useState(false);
  const [editDates, setEditDates] = useState({ startDate: "", endDate: "" });
  const [updatingDates, setUpdatingDates] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Please log in to view your bookings.");
        return;
      }

      const data = await getUserBookings(user.id);
      setBookings(data);
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking() {
    if (!selectedBooking) return;

    try {
      setCancelling(true);
      await cancelBooking(selectedBooking.id);
      await loadBookings();
      setShowCancelConfirm(false);
      setSelectedBooking(null);
    } catch (err) {
      setError(err.message || "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  }

  function openEditDates(booking) {
    setSelectedBooking(booking);
    setEditDates({
      startDate: booking.start_date,
      endDate: booking.end_date,
    });
    setShowEditDates(true);
  }

  async function handleUpdateDates() {
    if (!selectedBooking || !editDates.startDate || !editDates.endDate) return;

    try {
      setUpdatingDates(true);
      await updateBookingDates(selectedBooking.id, editDates.startDate, editDates.endDate);
      await loadBookings();
      setShowEditDates(false);
      setSelectedBooking(null);
      setEditDates({ startDate: "", endDate: "" });
    } catch (err) {
      setError(err.message || "Failed to update booking dates.");
    } finally {
      setUpdatingDates(false);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "pending":
        return "#ffead0";
      case "confirmed":
        return "#d4edda";
      case "cancelled":
        return "#f8d7da";
      case "rejected":
        return "#f8d7da";
      case "completed":
        return "#cce5ff";
      default:
        return "#e0e0e0";
    }
  }

  function getStatusTextColor(status) {
    switch (status) {
      case "pending":
        return "#161616";
      case "confirmed":
        return "#155724";
      case "cancelled":
        return "#721c24";
      case "rejected":
        return "#721c24";
      case "completed":
        return "#004085";
      default:
        return "#161616";
    }
  }

  if (loading) {
    return (
      <div className="user-bookings-container">
        <h1>My Bookings</h1>
        <div className="bookings-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBookingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="user-bookings-container">
      <h1>My Bookings</h1>

      {error && <div className="error-message red">{error}</div>}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
          <Link to="/vans" className="link-button">
            Browse Vans
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card-header">
                <img
                  src={booking.vans?.imageUrl}
                  alt={booking.vans?.name}
                  className="booking-card-image"
                />
                <div className="booking-card-info">
                  <h3>{booking.vans?.name}</h3>
                  <p className="booking-card-type">{booking.vans?.type}</p>
                </div>
                <div
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(booking.status),
                    color: getStatusTextColor(booking.status),
                  }}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </div>

              <div className="booking-card-details">
                <div className="detail-row">
                  <span className="label">Start Date:</span>
                  <span className="value">
                    {new Date(booking.start_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">End Date:</span>
                  <span className="value">
                    {new Date(booking.end_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Total Price:</span>
                  <span className="value">${booking.total_price}</span>
                </div>
                {booking.cancellation_deadline && (
                  <div className="detail-row">
                    <span className="label">Cancellation Deadline:</span>
                    <span className="value">
                      {new Date(booking.cancellation_deadline).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="booking-card-actions">
                <Link
                  to={`/bookings/${booking.id}/confirmation`}
                  className="link-button secondary"
                >
                  View Details
                </Link>
                {booking.status === "pending" && (
                  <button
                    onClick={() => openEditDates(booking)}
                    className="link-button secondary"
                  >
                    Edit Dates
                  </button>
                )}
                {(booking.status === "pending" || booking.status === "confirmed") && (
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowCancelConfirm(true);
                    }}
                    className="link-button cancel-button"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCancelConfirm && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Cancel Booking?</h2>
            <p>
              Are you sure you want to cancel your booking for{" "}
              <strong>{selectedBooking.vans?.name}</strong>?
            </p>
            <p className="cancel-warning">
              Cancellation fees may apply based on the timing of your cancellation.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setSelectedBooking(null);
                }}
                className="link-button secondary"
                disabled={cancelling}
              >
                No, Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="link-button cancel-button"
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditDates && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Booking Dates</h2>
            <p>
              Update your booking dates for{" "}
              <strong>{selectedBooking.vans?.name}</strong>
            </p>
            <div className="edit-dates-form">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={editDates.startDate}
                  onChange={(e) => setEditDates({ ...editDates, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={editDates.endDate}
                  onChange={(e) => setEditDates({ ...editDates, endDate: e.target.value })}
                  min={editDates.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowEditDates(false);
                  setSelectedBooking(null);
                  setEditDates({ startDate: "", endDate: "" });
                }}
                className="link-button secondary"
                disabled={updatingDates}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDates}
                className="link-button"
                disabled={updatingDates}
              >
                {updatingDates ? "Updating..." : "Update Dates"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
