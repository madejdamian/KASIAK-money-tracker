import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faArrowTrendUp,
  faArrowTrendDown,
  faCreditCard,
  faMoneyCheckDollar,
  faRightToBracket,
  faRightFromBracket,
  faXmark,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { useMediaQuery } from "@react-hook/media-query";
import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../store/auth-slice";

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const indicatorRef = useRef();
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const id = pathParts[pathParts.length - 1];
  const userId = useSelector((state) => state.auth.user);
  const isSmallScreen = useMediaQuery("(max-width: 767.5px)");

  function handleLogout() {
    dispatch(authActions.logout());
    localStorage.removeItem("token");
    localStorage.removeItem("bg");
  }

  function handleActiveMenu() {
    setActiveMenu((prev) => !prev);
  }

  useEffect(() => {
    const indicator = indicatorRef.current;

    if (indicator) {
      switch (location.pathname) {
        case "/":
          indicator.style.transform = "translateY(0)";
          break;
        case "/dashboard":
          indicator.style.transform = "translateY(4rem)";
          break;
        case "/incomes":
          indicator.style.transform = "translateY(8rem)";
          break;
        case `/incomes/${id}`:
          indicator.style.transform = "translateY(8rem)";
          break;
        case "/incomes/all-transactions":
          indicator.style.transform = "translateY(8rem)";
          break;
        case `/incomes/all-transactions/${id}`:
          indicator.style.transform = "translateY(8rem)";
          break;
        case "/expenses":
          indicator.style.transform = "translateY(12rem)";
          break;
        case `/expenses/${id}`:
          indicator.style.transform = "translateY(12rem)";
          break;
        case "/expenses/all-transactions":
          indicator.style.transform = "translateY(12rem)";
          break;
        case `/expenses/all-transactions/${id}`:
          indicator.style.transform = "translateY(12rem)";
          break;
        case "/summaries":
          indicator.style.transform = "translateY(16rem)";
          break;
        case "/login":
          indicator.style.transform = "translateY(calc(100vh - 9rem))";
          break;
        default:
          console.log("wrong pathname");
          break;
      }
    }
  }, [location.pathname]);

  return (
    <>
      {isSmallScreen && (
        <button
          className="w-10 h-10 bg-green-400 fixed left-[calc(100%-4rem)] top-4 z-50 rounded-xl cursor-pointer flex items-center justify-center"
          onClick={handleActiveMenu}
        >
          {
            <FontAwesomeIcon
              icon={activeMenu ? faXmark : faBars}
              className="text-xl text-white"
            />
          }
        </button>
      )}

      <nav
        className={`fixed z-40 w-full ${
          activeMenu ? "left-0" : "-left-full"
        } xsm:w-3/4 ${activeMenu ? "left-0" : "xsm:-left-3/4"}  sm:w-1/2 ${
          activeMenu ? "left-0" : "sm:-left-1/2"
        } md:left-0 md:w-16 h-screen bg-fourthColor transition-all duration-500 overflow-hidden md:hover:w-60`}
      >
        <div className="w-full h-12 flex items-center mt-3">
          <div className="w-12 h-12 mx-2 text-2xl shrink-0 flex items-center justify-center rounded-full font-bold text-white bg-secondColor">
            {userId ? userId.charAt(0).toUpperCase() : "?"}
          </div>
          <span className="w-44 block uppercase pl-4 text-amber-300 font-semibold">
            {userId && userId.length > 10 ? (
              <span>{userId.slice(0, 10) + "..."}</span>
            ) : (
              <span>{userId}</span>
            )}
            {!userId && <span>Logo</span>}
          </span>
        </div>
        <hr className="h-2 w-full mt-3 border-neutral-700" />
        <div className="w-full h-12 absolute mt-4 top-16 hover:bg-gray-700">
          <NavLink
            to={"/"}
            className="h-full w-full flex items-center relative text-white z-10"
          >
            <FontAwesomeIcon
              icon={faHouse}
              className="w-16 shrink-0 text-2xl"
            />
            <span className="w-44 block uppercase pl-4">Home</span>
          </NavLink>
        </div>
        <div className="w-full h-12 absolute mt-4 top-32 hover:bg-gray-700">
          <NavLink
            to={"/dashboard"}
            className="h-full w-full flex items-center relative text-white z-10"
          >
            <FontAwesomeIcon
              icon={faCreditCard}
              className="w-16 shrink-0 text-2xl"
            />
            <span className="w-44 block uppercase pl-4">Dashboard</span>
          </NavLink>
        </div>
        <div className="w-full h-12 absolute mt-4 top-48 hover:bg-gray-700">
          <NavLink
            to={"/incomes"}
            className="h-full w-full flex items-center relative text-white z-10"
          >
            <FontAwesomeIcon
              icon={faArrowTrendUp}
              className="w-16 shrink-0 text-2xl"
            />
            <span className="w-44 block uppercase pl-4">Incomes</span>
          </NavLink>
        </div>
        <div className="w-full h-12 absolute mt-4 top-64 hover:bg-gray-700">
          <NavLink
            to={"/expenses"}
            className="h-full w-full flex items-center relative text-white z-10"
          >
            <FontAwesomeIcon
              icon={faArrowTrendDown}
              className="w-16 shrink-0 text-2xl"
            />
            <span className="w-44 block uppercase pl-4">Expenses</span>
          </NavLink>
        </div>
        <div className="w-full h-12 absolute mt-4 top-80 hover:bg-gray-700">
          <NavLink
            to={"/summaries"}
            className="h-full w-full flex items-center relative text-white z-10"
          >
            <FontAwesomeIcon
              icon={faMoneyCheckDollar}
              className="w-16 shrink-0 text-2xl"
            />
            <span className="w-44 block uppercase pl-4">Summaries</span>
          </NavLink>
        </div>
        <div className="w-full h-12 absolute mt-4 top-[calc(100%-5rem)] hover:bg-gray-700">
          <NavLink
            to={"/login"}
            onClick={isAuthenticated ? handleLogout : null}
            className="h-full w-full flex items-center relative text-white z-10"
          >
            <FontAwesomeIcon
              icon={isAuthenticated ? faRightFromBracket : faRightToBracket}
              className="w-16 shrink-0 text-2xl"
            />
            <span className="w-44 block uppercase pl-4">
              {isAuthenticated ? "Logout" : "Login"}
            </span>
          </NavLink>
        </div>

        <div
          className="h-12 w-full absolute mt-4 top-16 border-b-2 border-[#28bf8a] transition-all duration-1000"
          id="indicator"
          ref={indicatorRef}
        ></div>
      </nav>
    </>
  );
};

export default Navbar;
