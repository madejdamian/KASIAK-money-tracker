import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../http/auth";
import {
  ErrorText,
  Field,
  inputClass,
  primaryButtonClass,
} from "../../components/ui/ui";
import logo from "/et-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: () => navigate("/", { replace: true }),
  });

  function handleSubmit(event) {
    event.preventDefault();
    mutate({ username, password });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-5">
        <img src={logo} alt="" className="w-24 mx-auto" />
        <h1 className="text-2xl font-semibold text-center">Budżet domowy</h1>

        <Field label="Użytkownik" htmlFor="username">
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Hasło" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>

        <ErrorText>{error}</ErrorText>

        <button type="submit" disabled={isPending} className={primaryButtonClass}>
          {isPending ? "Logowanie..." : "Zaloguj"}
        </button>
      </form>
    </div>
  );
};

export default Login;
