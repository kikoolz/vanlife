import { useState, useRef, useEffect } from "react";

export default function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  priority = false,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      img.addEventListener("load", () => setIsLoaded(true));
      img.addEventListener("error", () => setIsError(true));
    }
    return () => {
      if (img) {
        img.removeEventListener("load", () => setIsLoaded(true));
        img.removeEventListener("error", () => setIsError(true));
      }
    };
  }, []);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src]);

  return (
    <>
      {!isLoaded && !isError && (
        <div
          className={`image-placeholder ${className}`}
          style={{ width, height }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${className}`}
        loading={loading}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        width={width}
        height={height}
        style={{
          display: isError ? "none" : "block",
        }}
        {...props}
      />
      {isError && (
        <div
          className={`image-error ${className}`}
          style={{ width, height }}
        >
          Image not available
        </div>
      )}
    </>
  );
}
