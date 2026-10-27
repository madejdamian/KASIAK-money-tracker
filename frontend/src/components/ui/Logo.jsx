import React from "react";
import logo from "/et-logo.png";

// The app mark: the square wallet tile and the name set next to it as one piece.
const sizes = {
  md: { tile: "w-12 h-12 rounded-xl", text: "text-3xl", gap: "gap-3" },
  lg: { tile: "w-16 h-16 rounded-[1.1rem]", text: "text-[2.75rem]", gap: "gap-4" },
};

const Logo = ({ size = "md" }) => {
  const style = sizes[size];
  return (
    <span className={`inline-flex items-center ${style.gap}`}>
      <img src={logo} alt="" className={`${style.tile} shrink-0`} />
      <span className={`font-display font-black leading-none tracking-tight text-brand-soft ${style.text}`}>
        Kasiak
      </span>
    </span>
  );
};

export default Logo;
