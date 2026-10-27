import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootElement from "./components/root-element/RootElement";
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import Incomes from "./pages/incomes/Incomes";
import Expenses from "./pages/expenses/Expenses";
import Summaries from "./pages/summaries/Summaries";
import Login from "./pages/login/Login";
import "./App.css";
import ErrorBoundary from "./components/error/ErrorBoundary";
import TransactionElement from "./pages/transactionElement/TransactionElement";
import AllTransactions from "./pages/allTransactions/AllTransactions";
import ProtectedRoute from "./components/protectedRoutes/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootElement />,
    errorElement: <ErrorBoundary />,
    id: "root",
    children: [
      { index: true, element: <Home /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          {
            path: "incomes",
            element: <Incomes />,
          },
          { path: "incomes/:id", element: <TransactionElement /> },
          { path: "incomes/all-transactions", element: <AllTransactions /> },
          {
            path: "incomes/all-transactions/:id",
            element: <TransactionElement />,
          },
          { path: "expenses", element: <Expenses /> },
          { path: "expenses/:id", element: <TransactionElement /> },
          { path: "expenses/all-transactions", element: <AllTransactions /> },
          {
            path: "expenses/all-transactions/:id",
            element: <TransactionElement />,
          },
          { path: "summaries", element: <Summaries /> },
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
