import { useState, useEffect } from "react";
import { getHostBookings, updateBookingStatus } from "../../api";
import { getDemoHostId } from "../../utils";

export default function HostBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, cancelled, rejected, completed

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const hostId = await getDemoHostId();
      const data = await getHostBookings(hostId);
      setBookings(data);
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(bookingId, newStatus) {
    try {
      await updateBookingStatus(bookingId, newStatus);
      await loadBookings();
    } catch (err) {
      setError(err.message || "Failed to update booking status.");
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

  const filteredBookings = filter === "all" 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const revenue = bookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + b.total_price, 0);

  if (loading) {
    return (
      <div className="host-bookings-container">
        <h1>Host Bookings</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="host-bookings-container">
      <h1>Host Bookings</h1>

      <div className="host-bookings-stats">
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Confirmed</span>
          <span className="stat-value">{confirmedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Revenue</span>
          <span className="stat-value">${revenue}</span>
        </div>
      </div>

      {error && <div className="error-message red">{error}</div>}

      <div className="host-bookings-filters">
        <button
          className={`filter-button ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({bookings.length})
        </button>
        <button
          className={`filter-button ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`filter-button ${filter === "confirmed" ? "active" : ""}`}
          onClick={() => setFilter("confirmed")}
        >
          Confirmed ({confirmedCount})
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
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
                  <span className="label">Booking ID:</span>
                  <span className="value">{booking.id.slice(0, 8)}...</span>
                </div>
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
                <div className="detail-row">
                  <span className="label">Booked On:</span>
                  <span className="value">
                    {new Date(booking.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {booking.status === "pending" && (
                <div className="booking-card-actions">
                  <button
                    onClick={() => handleUpdateStatus(booking.id, "rejected")}
                    className="link-button reject-button"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                    className="link-button accept-button"
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
