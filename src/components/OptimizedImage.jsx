import { useState, useRef, useEffect } from "react";

export default function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
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
        className={`${className} ${isLoaded ? "loaded" : ""}`}
        loading={loading}
        width={width}
        height={height}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
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
