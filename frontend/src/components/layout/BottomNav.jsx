import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faCartShopping,
  faPiggyBank,
  faGear,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";

const items = [
  { to: "/", label: "Budżet", icon: faWallet, end: true },
  { to: "/expenses", label: "Wydatki", icon: faCartShopping },
  { to: "/deposits", label: "Wpłaty", icon: faPiggyBank },
  { to: "/analysis", label: "Analizy", icon: faChartPie },
  { to: "/settings", label: "Ustawienia", icon: faGear },
];

const BottomNav = () => (
  <nav className="fixed bottom-0 inset-x-0 z-40 bg-fourthColor border-t border-neutral-800 pb-[env(safe-area-inset-bottom)]">
    <ul className="max-w-2xl mx-auto grid grid-cols-5">
      {items.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `h-16 flex flex-col items-center justify-center gap-1 text-xs ${
                isActive ? "text-secondColor" : "text-neutral-400"
              }`
            }
          >
            <FontAwesomeIcon icon={item.icon} className="text-xl" />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default BottomNav;
