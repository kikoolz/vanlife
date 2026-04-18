import { useNavigate, useRouteError } from "react-router-dom";

export default function Error() {
  const error = useRouteError() || {};
  const navigate = useNavigate();

  const getErrorMessage = (status, message) => {
    switch (status) {
      case 401:
        return {
          title: "Authentication Required",
          message: "Your session is missing or invalid. Please log in again.",
          action: "Log In",
          redirect: "/login",
        };
      case 403:
        return {
          title: "Access Denied",
          message: "You don't have permission to access this page.",
          action: "Go Home",
          redirect: "/",
        };
      case 404:
        return {
          title: "Page Not Found",
          message: "The page you're looking for doesn't exist.",
          action: "Go Home",
          redirect: "/",
        };
      case 500:
        return {
          title: "Server Error",
          message: "Something went wrong on our end. Please try again later.",
          action: "Go Home",
          redirect: "/",
        };
      default:
        return {
          title: "Oops! Something went wrong",
          message: message || "An unexpected error occurred.",
          action: "Go Home",
          redirect: "/",
        };
    }
  };

  const { title, message, action, redirect } = getErrorMessage(
    error.status,
    error.message,
  );

  return (
    <div className="error-container">
      <h1>{title}</h1>
      <p>{message}</p>
      {error.statusText ? (
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          Error {error.status}: {error.statusText}
        </p>
      ) : null}
      <button
        onClick={() => navigate(redirect)}
        style={{ marginTop: "1.5rem" }}
      >
        {action}
      </button>
    </div>
  );
}
