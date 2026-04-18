import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVan } from "../../api";
import { getDemoHostId } from "../../utils";
import ImageUploader from "../../components/ImageUploader";

export default function HostAddVan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    type: "simple",
    price: "",
    description: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const hostId = await getDemoHostId();
      console.log("Host ID:", hostId, typeof hostId);
      // Generate a unique ID using timestamp
      const uniqueId = Date.now();
      const vanData = {
        id: uniqueId,
        name: formData.name,
        type: formData.type,
        price: parseFloat(formData.price),
        description: formData.description,
        imageUrl: imageUrl,
        host_id: String(hostId),
      };

      const newVan = await createVan(vanData);
      console.log("New van created:", newVan);
      navigate(`/host/vans/${newVan.id}`);
    } catch (err) {
      setError("Failed to create van. Please try again.");
      console.error("Error creating van:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="host-add-van">
      <h1>Add New Van</h1>
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
            onClick={() => navigate("/host/vans")}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? "Creating..." : "Create Van"}
          </button>
        </div>
      </form>
    </div>
  );
}
