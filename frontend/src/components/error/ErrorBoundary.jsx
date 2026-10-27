import React from "react";
import { useNavigate, useRouteError } from "react-router-dom";

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const notFound = error?.status === 404;

  return (
    <div className="min-h-screen bg-main text-white flex flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="text-4xl font-semibold">{notFound ? "404" : "Błąd"}</span>
      <p className="text-neutral-300">
        {notFound ? "Nie znaleziono strony." : "Coś poszło nie tak."}
      </p>
      <button
        type="button"
        className="h-12 px-6 rounded-xl bg-neutral-800 hover:bg-neutral-700"
        onClick={() => navigate("/")}
      >
        Wróć do budżetu
      </button>
    </div>
  );
};

export default ErrorBoundary;
