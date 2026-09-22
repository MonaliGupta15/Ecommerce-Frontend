import Buyerpage from "./Buyer/Buyerpage";
import SellerPage from "./Seller/SellerPage";

const Dashboard = ({ setPage }) => {
  const role = localStorage.getItem("role") || "buyer";

  return (
    <div>
      {role === "seller" ? (
        <SellerPage setPage={setPage} />
      ) : (
        <Buyerpage setPage={setPage} />
      )}
    </div>
  );
};

export default Dashboard;
