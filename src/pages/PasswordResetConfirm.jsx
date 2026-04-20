import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { validatePassword } from "../utils/validation";

export default function PasswordResetConfirm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we have the access token from the reset email
    const accessToken = searchParams.get("access_token");
    if (!accessToken) {
      setMessage({
        type: "error",
        text: "Invalid or expired reset link. Please request a new password reset.",
      });
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setMessage({
        type: "error",
        text: passwordValidation.message,
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordValidation.value,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Password updated successfully! You can now log in with your new password.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h1>Set New Password</h1>
      <p className="login-subtitle">Enter your new password below</p>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit" disabled={loading} className="link-button">
          {loading ? "Updating..." : "Update Password"}
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
