import { useState } from "react";
import { useNavigate, useLoaderData, useOutletContext } from "react-router-dom";
import { updateVan, deleteVan } from "../../api";
import { sanitizeString, validatePrice } from "../../utils";
import ImageUploader from "../../components/ImageUploader";

export async function loader({ params, request }) {
  // This loader will receive the van data from the parent route
  return null;
}

export default function HostEditVan() {
  const navigate = useNavigate();
  const { currentVan } = useOutletContext();
  
  const [formData, setFormData] = useState({
    name: currentVan?.name || "",
    type: currentVan?.type || "simple",
    price: currentVan?.price || "",
    description: currentVan?.description || "",
  });
  const [imageUrl, setImageUrl] = useState(currentVan?.imageUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (publicUrl) => {
    setImageUrl(publicUrl);
  };

  const handleImageDelete = () => {
    setImageUrl("");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteVan(currentVan.id);
      navigate("/host/vans");
    } catch (err) {
      setError(err.message || "Failed to delete van. Please try again.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!formData.name.trim()) {
        setError("Van name is required.");
        setIsSubmitting(false);
        return;
      }

      if (!validatePrice(formData.price)) {
        setError("Please enter a valid price.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.description.trim()) {
        setError("Description is required.");
        setIsSubmitting(false);
        return;
      }

      const vanData = {
        name: sanitizeString(formData.name),
        type: formData.type,
        price: parseFloat(formData.price),
        description: sanitizeString(formData.description),
        imageUrl: imageUrl,
      };

      await updateVan(currentVan.id, vanData);
      navigate(`/host/vans/${currentVan.id}`);
    } catch (err) {
      setError(err.message || "Failed to update van. Please check your input and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentVan) {
    return <div>Loading van data...</div>;
  }

  return (
    <div className="host-add-van">
      <h1>Edit Van</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="van-form">
        <div className="form-group">
          <label htmlFor="name">Van Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter van name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Van Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
          >
            <option value="simple">Simple</option>
            <option value="rugged">Rugged</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price per Day ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            placeholder="Enter price per day"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="5"
            placeholder="Describe your van"
          />
        </div>

        <div className="form-group">
          <label>Van Image</label>
          <ImageUploader
            onImageUpload={handleImageUpload}
            existingImageUrl={imageUrl}
            onImageDelete={handleImageDelete}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/host/vans/${currentVan.id}`)}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="delete-button"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Van"}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete this van? This action cannot be undone.</p>
            <div className="delete-confirmation-actions">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="delete-confirm-button"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
