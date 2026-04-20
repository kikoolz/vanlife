import { Link, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../api";
import { getAuthSession } from "../utils";
import { validateEmail, validatePassword } from "../utils/validation";

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

export default function Login() {
  const { message, redirectTo } = useLoaderData();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message);
      setIsSubmitting(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setIsSubmitting(false);
      return;
    }

    try {
      await loginUser({ email: emailValidation.value, password: passwordValidation.value });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <h1>Sign in to your account</h1>
      {message ? <h3 className="red">{message}</h3> : null}
      {error ? <h3 className="red">{error}</h3> : null}

      <form onSubmit={handleSubmit} className="login-form">
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
          autoComplete="current-password"
          minLength="8"
          required
          aria-label="Password"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p className="auth-switch-copy">
        Need an account?{" "}
        <Link to={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}>
          Sign up
        </Link>
      </p>

      <p className="auth-switch-copy">
        <Link to="/password-reset">Forgot password?</Link>
      </p>
    </div>
  );
}
