import Buyerpage from "./Buyer/Buyerpage";
import SellerPage from "./Seller/SellerPage";

const Dashboard = ({ setPage }) => {
  const role = localStorage.getItem("role");

  if (!role) return <p>Loading...</p>;

  return (
    <div>
      {role === "buyer"  && <Buyerpage  setPage={setPage} />}
      {role === "seller" && <SellerPage setPage={setPage} />}
    </div>
  );
};

export default Dashboard;
