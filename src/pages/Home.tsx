import { Navigate } from "react-router";

const Home = () => {
  return <Navigate to={"/dashboard/user"} />;
};

export default Home;
