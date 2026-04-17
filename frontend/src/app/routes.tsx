import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { StockAnalysis } from "./pages/StockAnalysis";
import { Portfolio } from "./pages/Portfolio";
import { Reports } from "./pages/Reports";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <StockAnalysis />,
      },
      {
        path: "portfolio",
        element: <Portfolio />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
