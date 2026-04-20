import { Outlet, useNavigation, Link, NavLink } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import SEO from "./SEO";

export default function Layout() {
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  return (
    <div className="site-wrapper">
      <SEO />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      {isNavigating ? (
        <div className="route-loading" aria-live="polite">
          Loading page...
        </div>
      ) : null}
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
