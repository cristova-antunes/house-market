import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

//Pages
import Explore from "./pages/Explore"
import Category from "./pages/Category"
import ListingDetail from "./pages/ListingDetail"
import ForgotPassword from "./pages/ForgotPassword"
import Offers from "./pages/Offers"
import Profile from "./pages/Profile"
import CreateListing from "./pages/CreateListing"
import EditListing from "./pages/EditListing"
import Contact from "./pages/Contact"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"

//Components
import Navbar from "./components/Navbar"
import PrivateRoute from "./components/PrivateRoute"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/category/:categoryName" element={<Category />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/edit-listing/:listingId" element={<EditListing />} />
          <Route
            path="/category/:categoryName/:listingId"
            element={<ListingDetail />}
          />
          <Route path="/contact/:landlordId" element={<Contact />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>

        <Navbar />
      </Router>

      <ToastContainer />
    </>
  )
}

export default App
