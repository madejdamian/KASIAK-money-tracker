import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
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
    <div className="min-h-screen bg-ink text-neutral-50">
      {showNav && <Sidebar />}
      <main className={showNav ? "pb-28 lg:pb-16 lg:pl-72" : ""}>
        <div className={showNav ? "lg:px-8 lg:max-w-[1640px]" : ""}>
          {restoring ? (
            <p className="text-neutral-400 text-center pt-24">Wczytywanie...</p>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};

export default RootElement;
