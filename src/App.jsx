import { lazy } from "react";
import {
  RouterProvider,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import HostLayout from "./components/HostLayout";
import Error from "./components/Error";
import ErrorBoundary from "./components/ErrorBoundary";
import BookingConfirmation from "./components/BookingConfirmation";
import UserBookings from "./pages/UserBookings";
import UserProfile from "./pages/UserProfile";
import PasswordReset from "./pages/PasswordReset";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import HostProfile from "./pages/Host/HostProfile";
import HostBookings from "./pages/Host/HostBookings";
import { requireAuth } from "./utils";

function lazyRoute(importer) {
  return async () => {
    const module = await importer();
    const routeConfig = {
      Component: module.default,
    };

    if (module.loader) {
      routeConfig.loader = module.loader;
    }

    return routeConfig;
  };
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<Error />}>
      <Route
        index
        lazy={lazyRoute(() => import("./pages/Home"))}
        errorElement={<Error />}
      />
      <Route
        path="about"
        lazy={lazyRoute(() => import("./pages/About"))}
        errorElement={<Error />}
      />
      <Route
        path="login"
        lazy={lazyRoute(() => import("./pages/Login"))}
        errorElement={<Error />}
      />
      <Route
        path="signup"
        lazy={lazyRoute(() => import("./pages/Signup"))}
        errorElement={<Error />}
      />
      <Route
        path="password-reset"
        element={<PasswordReset />}
        errorElement={<Error />}
      />
      <Route
        path="password-reset/confirm"
        element={<PasswordResetConfirm />}
        errorElement={<Error />}
      />
      <Route path="vans">
        <Route
          index
          loader={requireAuth}
          lazy={lazyRoute(() => import("./pages/Vans/Vans"))}
          errorElement={<Error />}
        />
        <Route
          path=":id"
          loader={requireAuth}
          lazy={lazyRoute(() => import("./pages/Vans/VanDetail"))}
          errorElement={<Error />}
        />
      </Route>
      <Route
        path="bookings/:id/confirmation"
        element={<BookingConfirmation />}
        errorElement={<Error />}
      />
      <Route
        path="bookings"
        element={<UserBookings />}
        errorElement={<Error />}
      />
      <Route
        path="profile"
        element={<UserProfile />}
        errorElement={<Error />}
      />
      <Route path="host" element={<HostLayout />} errorElement={<Error />}>
        <Route
          index
          lazy={lazyRoute(() => import("./pages/Host/Dashboard"))}
          errorElement={<Error />}
        />
        <Route
          path="profile"
          element={<HostProfile />}
          errorElement={<Error />}
        />
        <Route
          path="income"
          lazy={lazyRoute(() => import("./pages/Host/Income"))}
          errorElement={<Error />}
        />
        <Route
          path="reviews"
          loader={requireAuth}
          lazy={lazyRoute(() => import("./pages/Host/Reviews"))}
          errorElement={<Error />}
        />
        <Route
          path="bookings"
          element={<HostBookings />}
          errorElement={<Error />}
        />
        <Route
          path="vans"
          lazy={lazyRoute(() => import("./pages/Host/HostVans"))}
          errorElement={<Error />}
        />
        <Route
          path="vans/add"
          loader={requireAuth}
          lazy={lazyRoute(() => import("./pages/Host/HostAddVan"))}
          errorElement={<Error />}
        />
        <Route
          path="vans/:id"
          lazy={lazyRoute(() => import("./pages/Host/HostVansDetails"))}
          errorElement={<Error />}
        >
          <Route
            index
            loader={requireAuth}
            lazy={lazyRoute(() => import("./pages/Host/HostVanInfo"))}
            errorElement={<Error />}
          />
          <Route
            path="pricing"
            loader={requireAuth}
            lazy={lazyRoute(() => import("./pages/Host/HostVanPricing"))}
            errorElement={<Error />}
          />
          <Route
            path="photos"
            loader={requireAuth}
            lazy={lazyRoute(() => import("./pages/Host/HostVanPhotos"))}
            errorElement={<Error />}
          />
          <Route
            path="edit"
            loader={requireAuth}
            lazy={lazyRoute(() => import("./pages/Host/HostEditVan"))}
            errorElement={<Error />}
          />
        </Route>
      </Route>
      <Route
        path="*"
        lazy={lazyRoute(() => import("./pages/NotFound"))}
        errorElement={<Error />}
      />
    </Route>,
  ),
);

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider
        router={router}
        fallbackElement={<div className="route-loading">Loading...</div>}
      />
    </ErrorBoundary>
  );
}
