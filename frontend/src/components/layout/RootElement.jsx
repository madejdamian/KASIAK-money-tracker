import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import { refreshToken } from "../../http/auth";

const RootElement = () => {
  const location = useLocation();
  // Without a saved token the app first tries to restore the login from the long-lived
  // refresh cookie (e.g. after the browser cleared its storage), then shows the login page.
  const [restoring, setRestoring] = useState(!localStorage.getItem("token"));

  useEffect(() => {
    if (!restoring) return;
    refreshToken()
      .catch(() => {
        // no valid session: the login page is shown
      })
      .finally(() => setRestoring(false));
  }, [restoring]);

  const showNav =
    !restoring && !!localStorage.getItem("token") && location.pathname !== "/login";

  return (
    <div className="min-h-screen bg-main text-white">
      <main className={`max-w-2xl mx-auto ${showNav ? "pb-28" : ""}`}>
        {restoring ? (
          <p className="text-neutral-400 text-center pt-24">Wczytywanie...</p>
        ) : (
          <Outlet />
        )}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};

export default RootElement;
