import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

const RootElement = () => {
  const location = useLocation();
  const showNav =
    !!localStorage.getItem("token") && location.pathname !== "/login";

  return (
    <div className="min-h-screen bg-main text-white">
      <main className={`max-w-2xl mx-auto ${showNav ? "pb-28" : ""}`}>
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};

export default RootElement;
