import { Helmet } from "react-helmet-async";

export default function SEO({
  title = "VanLife - Rent the Perfect Van for Your Road Trip Adventure",
  description = "Add adventure to your life by joining the #vanlife movement. Rent the perfect van to make your perfect road trip. Browse our selection of luxury, rugged, and simple vans.",
  image = "https://vanlife.com/og-image.jpg",
  url = "https://vanlife.com",
  type = "website",
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
