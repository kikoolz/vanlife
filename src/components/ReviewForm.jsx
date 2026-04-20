import { useState, useEffect } from "react";
import { createReview, getUserReviewForBooking } from "../api";
import { getCurrentUser } from "../utils";
import { validateRating, validateComment } from "../utils/validation";

export default function ReviewForm({ booking, van, onReviewSubmitted }) {
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndReview();
  }, [booking]);

  async function loadUserAndReview() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const review = await getUserReviewForBooking(booking.id);
      setExistingReview(review);
      
      if (review) {
        setRating(review.rating);
        setComment(review.comment);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load review data" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const ratingValidation = validateRating(rating);
    if (!ratingValidation.isValid) {
      setMessage({ type: "error", text: ratingValidation.message });
      setSubmitting(false);
      return;
    }

    const commentValidation = validateComment(comment);
    if (!commentValidation.isValid) {
      setMessage({ type: "error", text: commentValidation.message });
      setSubmitting(false);
      return;
    }

    try {
      const reviewData = {
        vanId: van.id,
        userId: user.id,
        bookingId: booking.id,
        rating: ratingValidation.value,
        comment: commentValidation.value,
      };

      const review = await createReview(reviewData);
      setMessage({ type: "success", text: "Review submitted successfully!" });
      setExistingReview(review);
      
      if (onReviewSubmitted) {
        onReviewSubmitted(review);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to submit review" });
    } finally {
      setSubmitting(false);
    }
  }

  function renderStars(currentRating, interactive = true) {
    return (
      <div className="review-stars-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-button ${star <= (interactive ? hoverRating || rating : currentRating) ? "filled" : ""}`}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && !existingReview && setRating(star)}
            disabled={!interactive || existingReview}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading review form...</div>;
  }

  if (existingReview) {
    return (
      <div className="review-form-container existing-review">
        <h3>Your Review</h3>
        {renderStars(existingReview.rating, false)}
        <p className="review-text">{existingReview.comment}</p>
        <p className="review-date">
          Reviewed on {new Date(existingReview.created_at).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <div className="review-form-container">
      <h3>Write a Review</h3>
      <p className="review-subtitle">Share your experience with {van.name}</p>
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label>Rating</label>
          {renderStars(rating)}
          {rating > 0 && (
            <span className="rating-text">{rating} star{rating > 1 ? "s" : ""}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="comment">Your Review</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Tell us about your experience..."
            className="review-textarea"
            required
          />
        </div>

        <button type="submit" disabled={submitting || rating === 0} className="link-button">
          {submitting ? "Submitting..." : "Submit Review"}
        </button>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
