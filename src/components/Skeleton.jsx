import React from "react";

export function SkeletonVanCard() {
  return (
    <div className="van-tile skeleton">
      <div className="skeleton-image"></div>
      <div className="van-info">
        <div className="skeleton-text skeleton-title"></div>
        <div className="skeleton-text skeleton-price"></div>
      </div>
    </div>
  );
}

export function SkeletonBookingCard() {
  return (
    <div className="booking-card skeleton">
      <div className="booking-card-header">
        <div className="skeleton-image skeleton-booking-image"></div>
        <div className="booking-card-info">
          <div className="skeleton-text skeleton-title"></div>
          <div className="skeleton-text skeleton-subtitle"></div>
        </div>
        <div className="skeleton-badge"></div>
      </div>
      <div className="booking-card-details">
        <div className="skeleton-text skeleton-detail"></div>
        <div className="skeleton-text skeleton-detail"></div>
        <div className="skeleton-text skeleton-detail"></div>
      </div>
      <div className="booking-card-actions">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
}

export function SkeletonProfileForm() {
  return (
    <div className="profile-card skeleton">
      <div className="skeleton-text skeleton-title"></div>
      <div className="skeleton-form-group">
        <div className="skeleton-text skeleton-label"></div>
        <div className="skeleton-input"></div>
      </div>
      <div className="skeleton-form-group">
        <div className="skeleton-text skeleton-label"></div>
        <div className="skeleton-input"></div>
      </div>
      <div className="skeleton-button"></div>
    </div>
  );
}

export function SkeletonReviewForm() {
  return (
    <div className="review-form-container skeleton">
      <div className="skeleton-text skeleton-title"></div>
      <div className="skeleton-stars"></div>
      <div className="skeleton-textarea"></div>
      <div className="skeleton-button"></div>
    </div>
  );
}

export function SkeletonText({ lines = 1, width = "100%" }) {
  return (
    <div className="skeleton-text-container">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton-text"
          style={{ width: index === lines - 1 ? "70%" : width }}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return <div className="skeleton-button"></div>;
}

export default function Skeleton({ type = "card" }) {
  if (type === "card") {
    return <SkeletonVanCard />;
  }
  if (type === "booking") {
    return <SkeletonBookingCard />;
  }
  if (type === "profile") {
    return <SkeletonProfileForm />;
  }
  if (type === "review") {
    return <SkeletonReviewForm />;
  }
  if (type === "text") {
    return <SkeletonText lines={3} />;
  }
  if (type === "button") {
    return <SkeletonButton />;
  }
  return null;
}
