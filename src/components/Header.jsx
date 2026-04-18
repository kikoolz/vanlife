import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import avatarIcon from "../assets/images/avatar-icon.png";
import { getAuthSession, logout, subscribeToAuthChanges } from "../utils";

export default function Header() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const isAuthenticated = Boolean(session);

  useEffect(() => {
    let isMounted = true;

    getAuthSession()
      .then((currentSession) => {
        if (isMounted) {
          setSession(currentSession);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
        }
      });

    const subscription = subscribeToAuthChanges((nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const redirectTo = await logout();
    setSession(null);
    navigate(redirectTo, { replace: true });
  }

  return (
    <header>
      <Link className="site-logo" to="/">
        🚐VanLife
      </Link>
      <nav>
        <NavLink
          to="/host"
          className={({ isActive }) => (isActive ? "active-link" : null)}
        >
          Host
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active-link" : null)}
        >
          About
        </NavLink>
        <NavLink
          to="/vans"
          className={({ isActive }) => (isActive ? "active-link" : null)}
        >
          Vans
        </NavLink>
        {isAuthenticated ? (
          <button
            type="button"
            className="header-auth-button"
            onClick={handleLogout}
          >
            Log out
          </button>
        ) : (
          <Link to="/login" className="login-link" aria-label="Log in">
            <img
              src={avatarIcon}
              alt=""
              aria-hidden="true"
              className="login-icon"
            />
          </Link>
        )}
      </nav>
    </header>
  );
}
