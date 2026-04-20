import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getCurrentUser, getDemoHostId } from "../../utils";
import { SkeletonProfileForm } from "../../components/Skeleton";

export default function HostProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    bio: "",
    hostId: "",
  });

  useEffect(() => {
    loadHostProfile();
  }, []);

  async function loadHostProfile() {
    try {
      const currentUser = await getCurrentUser();
      const hostId = await getDemoHostId();
      setUser(currentUser);
      setFormData({
        fullName: currentUser.user_metadata?.full_name || "",
        email: currentUser.email || "",
        bio: currentUser.user_metadata?.bio || "",
        hostId: hostId,
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
          bio: formData.bio,
        },
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Host profile updated successfully!" });
      await loadHostProfile(); // Reload to get updated data
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
    return (
      <div className="profile-container">
        <h1>Host Profile</h1>
        <SkeletonProfileForm />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>Host Profile</h1>
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

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell guests about yourself and your vans..."
              className="profile-textarea"
            />
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
          <h2>Host Information</h2>
          <div className="info-item">
            <span className="info-label">Host ID:</span>
            <span className="info-value">{formData.hostId}</span>
          </div>
          <div className="info-item">
            <span className="info-label">User ID:</span>
            <span className="info-value">{user?.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Account Created:</span>
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
