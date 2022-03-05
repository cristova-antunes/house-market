import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

import { getAuth, updateProfile } from "firebase/auth"
import { db } from "../firebase.config"
import {
  doc,
  updateDoc,
  collection,
  query,
  getDocs,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore"

import ListingItem from "../components/ListingItem"

import { toast } from "react-toastify"
import Spinner from "../components/Spinner"
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg"
import homeIcon from "../assets/svg/homeIcon.svg"

export default function Profile() {
  const auth = getAuth()
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [changeDetails, setChangeDetails] = useState(false)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { name, email } = formData

  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingRef = collection(db, "listings")
      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      )

      const querySnap = await getDocs(q)

      let listings = []

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        })
      })

      setListings(listings)
      setLoading(false)
    }

    fetchUserListings()
  }, [auth.currentUser.uid])

  const onLogOut = () => {
    auth.signOut()
    navigate("/")
  }

  const handleSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        //update name in firebase
        await updateProfile(auth.currentUser, {
          displayName: name,
        })

        //update firestore
        const userRef = doc(db, "users", auth.currentUser.uid)
        await updateDoc(userRef, {
          name,
        })
      }
    } catch (error) {
      toast.error("Could not update profile details")
      console.error(error)
    }
  }

  const handleOnChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  const onChangeDetailsClick = () => {
    changeDetails && handleSubmit()

    setChangeDetails((prevState) => !prevState)
  }

  const onDelete = async (listingId) => {
    if (window.confirm("Are you sure you want to delete?")) {
      const docRef = doc(db, "listings", listingId)
      await deleteDoc(docRef)

      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      )

      setListings(updatedListings)
      toast.success("Successfully deleted listing")
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button className="logOut" onClick={onLogOut}>
          Logout
        </button>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal details</p>
          <p className="changePersonalDetails" onClick={onChangeDetailsClick}>
            {changeDetails ? "done" : "change"}
          </p>
        </div>

        <div className="profileCard">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="name"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              disabled={!changeDetails}
              value={name}
              onChange={handleOnChange}
            />

            <input
              type="text"
              id="email"
              className={!changeDetails ? "profileEmail" : "profileEmailActive"}
              disabled={!changeDetails}
              value={email}
              onChange={handleOnChange}
            />
          </form>
        </div>

        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}
