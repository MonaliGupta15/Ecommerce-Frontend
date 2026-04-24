import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Cartpage from "./Components/Buyer/Cartpage";
import Orderspage from "./Components/Buyer/Orderspage";


function App() {
  const [page, setPage] = useState(() => {
    return localStorage.getItem("page") || "login";
  });

  const handleSetPage = (newPage) => {
    localStorage.setItem("page", newPage);
    setPage(newPage);
  };

  return (
    <>
      <Toaster position="top-center" />
      {page === "register"  && <Register  setPage={handleSetPage} />}
      {page === "login"     && <Login     setPage={handleSetPage} />}
      {page === "dashboard" && <Dashboard setPage={handleSetPage} />}
      {page === "cart"      && <Cartpage  setPage={handleSetPage} />}
      {page === "orders" && <Orderspage setPage={handleSetPage} />}

    </>
  );
}

export default App;
