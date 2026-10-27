import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faCartShopping,
  faGear,
  faChartPie,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

const leftItems = [
  { to: "/", label: "Główna", icon: faWallet, end: true },
  { to: "/expenses", label: "Wydatki", icon: faCartShopping },
];

const rightItems = [
  { to: "/analysis", label: "Analizy", icon: faChartPie },
  { to: "/settings", label: "Ustawienia", icon: faGear },
];

const NavItem = ({ item }) => (
  <li>
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `h-[68px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold ${
          isActive ? "text-brand" : "text-neutral-400"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`h-8 w-14 rounded-full flex items-center justify-center transition-colors ${
              isActive ? "bg-brand text-on-brand" : ""
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="text-lg" />
          </span>
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  </li>
);

// Phone only (iPhone 15): the desktop uses the Sidebar. Adding an expense is the main action,
// so its button sits in the middle of the bar on every screen, always visible.
// Deposits and consumption are reached with the buttons at the bottom of the home screen.
const BottomNav = () => (
  <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-chrome border-t border-neutral-800 pb-[env(safe-area-inset-bottom)]">
    <ul className="grid grid-cols-5">
      {leftItems.map((item) => (
        <NavItem key={item.to} item={item} />
      ))}
      <li className="flex justify-center">
        <Link
          to="/expenses/new"
          aria-label="Dodaj wydatek"
          className="-mt-5 h-16 w-16 rounded-full bg-brand text-on-brand flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.55)] transition-colors active:bg-brand-soft"
        >
          <FontAwesomeIcon icon={faPlus} className="text-2xl" />
        </Link>
      </li>
      {rightItems.map((item) => (
        <NavItem key={item.to} item={item} />
      ))}
    </ul>
  </nav>
);

export default BottomNav;
