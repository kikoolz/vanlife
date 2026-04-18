import { useOutletContext } from "react-router-dom";
import ImageUploader from "../../components/ImageUploader";
import { updateVan, getHostVans } from "../../api";
import { useState } from "react";

export default function HostVanPhotos() {
  const { currentVan } = useOutletContext();
  const [localImageUrl, setLocalImageUrl] = useState(currentVan?.imageUrl || "");

  if (!currentVan) {
    return <div>Loading van data...</div>;
  }

  const handleImageUpload = async (publicUrl, path) => {
    console.log("Image uploaded:", publicUrl, path);
    try {
      await updateVan(currentVan.id, { imageUrl: publicUrl });
      setLocalImageUrl(publicUrl);
      console.log("Database updated successfully");
    } catch (err) {
      console.error("Failed to update database:", err);
      alert("Failed to save image to database");
    }
  };

  const handleImageDelete = async () => {
    console.log("Image deleted");
    try {
      await updateVan(currentVan.id, { imageUrl: "" });
      setLocalImageUrl("");
      console.log("Database updated successfully");
    } catch (err) {
      console.error("Failed to update database:", err);
      alert("Failed to remove image from database");
    }
  };

  return (
    <div className="host-van-photos">
      <h2>Van Photos</h2>
      <ImageUploader
        onImageUpload={handleImageUpload}
        existingImageUrl={localImageUrl}
        onImageDelete={handleImageDelete}
      />
    </div>
  );
}
