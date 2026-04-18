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
    try {
      await updateVan(currentVan.id, { imageUrl: publicUrl });
      setLocalImageUrl(publicUrl);
    } catch (err) {
      alert(err.message || "Failed to save image. Please try again.");
    }
  };

  const handleImageDelete = async () => {
    try {
      await updateVan(currentVan.id, { imageUrl: "" });
      setLocalImageUrl("");
    } catch (err) {
      alert(err.message || "Failed to remove image. Please try again.");
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
