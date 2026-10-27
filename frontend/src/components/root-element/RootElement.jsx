import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { authActions } from "../../store/auth-slice";
import SessionModal from "../modal/SessionModal";
import { modalActions } from "../../store/modal-slice";
import { useMutation } from "@tanstack/react-query";
import { refreshToken } from "../../http/auth";

const RootElement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { mutate } = useMutation({
    mutationFn: refreshToken,
    onError: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("bg");
      dispatch(authActions.logout());
      navigate("/login");
      dispatch(modalActions.showSessionExpiredInfo());
      // console.clear();
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      const currentDate = new Date();
      if (token) {
        const userId = jwtDecode(token).sub;
        const exp = jwtDecode(token).exp;
        const tokenDate = new Date(exp * 1000);
        if (currentDate >= tokenDate) {
          mutate();
        } else {
          dispatch(authActions.login(userId));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <SessionModal />
      <Navbar />
      <Outlet />
    </>
  );
};

export default RootElement;
