import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEye,
  faEyeSlash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import googleIcon from "../../assets/google-color-icon.png";
import Input from "../../components/form/Input";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../http/auth";
import { generateRandomColor } from "../../util/ColorGenerator";
import InProgressModal from "../../components/modal/InProgressModal";
import { useDispatch } from "react-redux";
import { modalActions } from "../../store/modal-slice";
import logo from "/et-logo.png";
import { useMediaQuery } from "@react-hook/media-query";

const Login = () => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});
  const dispatch = useDispatch();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate("/dashboard");
      localStorage.setItem("bg", generateRandomColor());
    },
    onError: (error) => {
      setFormErrors(error);
    },
  });

  const [typePassword, setTypePassword] = useState("password");

  function handleShowPassword() {
    if (typePassword === "password") {
      setTypePassword("text");
    } else {
      setTypePassword("password");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const values = Object.fromEntries(formData);
    setFormErrors({});
    mutate(values);
  }

  function showInProgressModal() {
    dispatch(modalActions.showInProgress());
  }

  return (
    <>
      <InProgressModal />
      <div className="w-full h-screen flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-main sm:bg-fourthColor w-full sm:w-2/3 lg:w-3/4 xlg:w-2/3 min-h-[35rem] flex flex-col lg:flex-row rounded-3xl overflow-hidden"
        >
          {!isSmallScreen && (
            <div className="lg:w-1/2 h-40 lg:h-auto lg:order-2 bg-black flex justify-center items-center">
              <img
                src={logo}
                alt=""
                className="w-40 lg:w-[20rem] xlg:w-[30rem]"
              />
            </div>
          )}
          <div className="lg:w-1/2 pb-6">
            <h1 className="text-center text-3xl text-white my-8 h-[10%] lg:text-2xl">
              Login
            </h1>
            <div className="w-[80%] mx-auto">
              <Input
                labelText="Username"
                icon={faUser}
                placeholder="Enter your username"
                type="text"
                inputId="username"
              />

              {formErrors && (
                <p className="text-red-500 h-4 -mt-4 mb-4">
                  {formErrors.username}
                </p>
              )}

              <Input
                labelText="Password"
                icon={faLock}
                placeholder="Enter your password"
                type={typePassword}
                inputId="password"
              >
                <button
                  type="button"
                  className="absolute right-4"
                  onClick={handleShowPassword}
                >
                  <FontAwesomeIcon
                    icon={typePassword === "password" ? faEyeSlash : faEye}
                  />
                </button>
              </Input>

              <div className="flex flex-col md:flex-row md:justify-between lg:flex-col lg:gap-2 2xl:flex-row 2xl:gap-0">
                {formErrors && (
                  <p className="text-red-500 h-4 md:-mt-3 lg:order-2 2xl:order-1 2xl:-mt-4">
                    {formErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 mt-12">
              <button
                type="submit"
                className="h-10 lg:h-9 w-40 text-white text-lg lg:text-base bg-secondColor rounded-3xl border-none transition-all duration-300 hover:bg-[#28bf8a] disabled:cursor-not-allowed disabled:bg-[#014029]"
                disabled={isPending}
              >
                {isPending ? "Logging in..." : "Login"}
              </button>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="h-[3px] w-[45%] bg-neutral-500"></div>
              <p className="text-neutral-500 text-xl">or</p>
              <div className="h-[3px] w-[45%] bg-neutral-500"></div>
            </div>

            <button
              type="button"
              className="h-10 flex items-center gap-4 mx-auto my-6 rounded-3xl bg-neutral-700 p-4 text-white transition-all duration-300 hover:bg-neutral-600"
              onClick={showInProgressModal}
            >
              <img src={googleIcon} width={20} height={40} />
              <span>Login with Google Account</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
