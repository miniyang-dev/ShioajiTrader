import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { StockAnalysis } from "./pages/StockAnalysis";
import { Portfolio } from "./pages/Portfolio";
import { Reports } from "./pages/Reports";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { 
        index: true, 
        Component: StockAnalysis 
      },
      { 
        path: "portfolio", 
        Component: Portfolio 
      },
      { 
        path: "reports", 
        Component: Reports 
      },
      { 
        path: "*", 
        Component: NotFound 
      },
    ],
  },
]);
