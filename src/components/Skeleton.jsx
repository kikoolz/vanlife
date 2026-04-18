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
  if (type === "text") {
    return <SkeletonText lines={3} />;
  }
  if (type === "button") {
    return <SkeletonButton />;
  }
  return null;
}
