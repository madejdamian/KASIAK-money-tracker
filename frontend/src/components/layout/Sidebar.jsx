import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCartShopping,
  faChartPie,
  faGaugeHigh,
  faGear,
  faPiggyBank,
  faRotate,
  faTags,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import Logo from "../ui/Logo";

const mainItems = [
  { to: "/", label: "Główna", icon: faWallet, end: true },
  { to: "/expenses", label: "Wydatki", icon: faCartShopping },
  { to: "/deposits", label: "Wpłaty", icon: faPiggyBank },
  { to: "/usage", label: "Zużycie", icon: faGaugeHigh },
  { to: "/analysis", label: "Analizy", icon: faChartPie },
  { to: "/settings", label: "Ustawienia", icon: faGear },
];

const moreItems = [
  { to: "/recurring", label: "Cykliczne", icon: faRotate },
  { to: "/templates", label: "Szablony", icon: faBolt },
  { to: "/tags", label: "Tagi", icon: faTags },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-4 h-12 px-4 rounded-2xl text-base transition-colors ${
    isActive
      ? "bg-brand text-on-brand font-bold"
      : "text-neutral-300 font-medium hover:bg-neutral-800 hover:text-neutral-50"
  }`;

const NavGroup = ({ items }) => (
  <ul className="flex flex-col gap-1">
    {items.map((item) => (
      <li key={item.to}>
        <NavLink to={item.to} end={item.end} className={linkClass}>
          <FontAwesomeIcon icon={item.icon} className="w-5" />
          {item.label}
        </NavLink>
      </li>
    ))}
  </ul>
);

// Desktop only (Full HD): the left menu. The phone uses BottomNav.
const Sidebar = () => (
  <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col gap-8 bg-chrome border-r border-neutral-800 px-5 py-8">
    <Link to="/" aria-label="Kasiak" className="px-2">
      <Logo />
    </Link>

    <Link
      to="/expenses/new"
      className="h-12 rounded-2xl bg-brand text-on-brand font-bold flex items-center justify-center transition-colors hover:bg-[#ffcd4d]"
    >
      + Wydatek
    </Link>

    <nav className="flex flex-col gap-6" aria-label="Menu">
      <NavGroup items={mainItems} />
      <div className="border-t border-neutral-800 pt-6">
        <NavGroup items={moreItems} />
      </div>
    </nav>
  </aside>
);

export default Sidebar;
