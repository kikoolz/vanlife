import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { validateEmail } from "../utils/validation";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setMessage({
        type: "error",
        text: emailValidation.message,
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailValidation.value, {
        redirectTo: `${window.location.origin}/password-reset/confirm`,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Password reset email sent! Check your inbox for further instructions.",
      });
      setEmail("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to send reset email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h1>Reset Password</h1>
      <p className="login-subtitle">Enter your email to receive a password reset link</p>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading} className="link-button">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>

      <Link to="/login" className="login-back-link">
        Back to Login
      </Link>
    </div>
  );
}
