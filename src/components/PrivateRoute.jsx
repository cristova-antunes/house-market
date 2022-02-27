import { Navigate, Outlet } from "react-router-dom";
import { useAuthStatus } from "../hooks/useAuthStatus";
import Spinner from "./Spinner";

export default function PrivateRoute() {
  const { isLoggedIn, checkingStatus } = useAuthStatus();

  if (checkingStatus) {
    return <Spinner />;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
}
