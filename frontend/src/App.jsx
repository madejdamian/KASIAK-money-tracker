import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootElement from "./components/layout/RootElement";
import ErrorBoundary from "./components/error/ErrorBoundary";
import ProtectedRoute from "./components/protectedRoutes/ProtectedRoute";
import Login from "./pages/login/Login";
import Budget from "./pages/budget/Budget";
import Expenses from "./pages/expenses/Expenses";
import ExpenseForm from "./pages/expenses/ExpenseForm";
import Deposits from "./pages/deposits/Deposits";
import DepositForm from "./pages/deposits/DepositForm";
import Analysis from "./pages/analysis/Analysis";
import Settings from "./pages/settings/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootElement />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Budget /> },
          { path: "expenses", element: <Expenses /> },
          { path: "expenses/:slug", element: <ExpenseForm /> },
          { path: "deposits", element: <Deposits /> },
          { path: "deposits/:slug", element: <DepositForm /> },
          { path: "analysis", element: <Analysis /> },
          { path: "settings", element: <Settings /> },
          { path: "login", element: <Login /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
