import { useState } from "react";
import { uploadVanImage, deleteVanImage } from "../api";
import { supabase } from "../lib/supabase";

export default function ImageUploader({ onImageUpload, existingImageUrl, onImageDelete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(existingImageUrl || "");

  if (!onImageUpload || !onImageDelete) {
    return <div className="error-message red">Error: Missing required props</div>;
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to upload images.");
        return;
      }

      const result = await uploadVanImage(file, user.id);
      setPreview(result.publicUrl);
      onImageUpload(result.publicUrl, result.path);
    } catch (err) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!preview) return;

    setIsUploading(true);
    setError("");

    try {
      if (preview.startsWith("https://nnhuztmohqdacuhhaoku.supabase.co/storage/v1/object/public/van-images/")) {
        const path = preview.replace("https://nnhuztmohqdacuhhaoku.supabase.co/storage/v1/object/public/van-images/", "");
        await deleteVanImage(path);
      }
      
      setPreview("");
      onImageDelete();
    } catch (err) {
      setError(err.message || "Failed to delete image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="image-uploader">
      {preview ? (
        <div className="image-preview-container">
          <img src={preview} alt="Van preview" className="image-preview" />
          <button
            type="button"
            onClick={handleDelete}
            disabled={isUploading}
            className="delete-image-button"
          >
            {isUploading ? "Deleting..." : "Remove Image"}
          </button>
        </div>
      ) : (
        <div
          className="upload-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="upload-content">
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="17 8 12 3 7 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="upload-text">Drag and drop an image here, or</p>
            <label className="upload-button">
              Browse Files
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
            <p className="upload-hint">Maximum file size: 5MB (JPEG, PNG, WebP)</p>
          </div>
        </div>
      )}

      {error && <div className="error-message red">{error}</div>}
    </div>
  );
}
