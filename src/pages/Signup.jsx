import { Link, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signupUser } from "../api";
import { getAuthSession } from "../utils";

export async function loader({ request }) {
  const session = await getAuthSession();
  const currentUrl = new URL(request.url);
  const redirectTo = currentUrl.searchParams.get("redirectTo") || "/host";

  if (session) {
    throw redirect(redirectTo);
  }

  return {
    message: currentUrl.searchParams.get("message"),
    redirectTo,
  };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Signup() {
  const { message, redirectTo } = useLoaderData();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim().toLowerCase() || "";
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";

    if (!name) {
      setError("Enter your full name.");
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await signupUser({ name, email, password });

      if (data.session) {
        navigate(redirectTo, { replace: true });
        return;
      }

      navigate(
        "/login?message=Account created. Check your email to confirm your account before signing in.",
        { replace: true },
      );
    } catch (err) {
      setError(err.message || "Unable to create your account.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <h1>Create your account</h1>
      {message ? <h3 className="red">{message}</h3> : null}
      {error ? <h3 className="red">{error}</h3> : null}

      <form onSubmit={handleSubmit} className="login-form">
        <input
          name="name"
          type="text"
          placeholder="Full name"
          autoComplete="name"
          required
          aria-label="Full name"
        />
        <input
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
          aria-label="Email address"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          minLength="8"
          required
          aria-label="Password"
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          autoComplete="new-password"
          minLength="8"
          required
          aria-label="Confirm password"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="auth-switch-copy">
        Already have an account?{" "}
        <Link to={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
