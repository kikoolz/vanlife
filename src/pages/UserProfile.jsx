import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../utils";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setFormData({
        fullName: currentUser.user_metadata?.full_name || "",
        email: currentUser.email || "",
      });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
        },
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully!" });
      await loadUserProfile(); // Reload to get updated data
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <div className="profile-card">
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled-input"
            />
            <small className="form-hint">Email cannot be changed</small>
          </div>

          <button type="submit" disabled={saving} className="link-button">
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </form>

        <div className="profile-info">
          <h2>Account Information</h2>
          <div className="info-item">
            <span className="info-label">User ID:</span>
            <span className="info-value">{user?.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Created:</span>
            <span className="info-value">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Sign In:</span>
            <span className="info-value">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
