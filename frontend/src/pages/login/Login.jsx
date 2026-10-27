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
import Logo from "../../components/ui/Logo";

// Just the logo and the password field, on both the phone and the desktop.
const Login = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: () => navigate("/", { replace: true }),
  });

  function handleSubmit(event) {
    event.preventDefault();
    mutate({ password });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-5">
        <h1 className="flex justify-center mb-6">
          <Logo size="lg" />
        </h1>

        <Field label="Hasło" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
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
