import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

import { getAuth, onAuthStateChanged } from "firebase/auth"
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase.config"
import { v4 as uuidv4 } from "uuid"

import { toast } from "react-toastify"
import Spinner from "../components/Spinner"

export default function CreateListing() {
  const [geolocationEnabled, setGeolocationEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: [],
    latitude: 0,
    longitude: 0,
  })

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData

  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef(true)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsLoading(true)

    if (discountedPrice >= regularPrice) {
      setIsLoading(false)
      toast.error("Discounted price needs to be less than regular price")
      return
    }

    if (images.length > 6) {
      setIsLoading(false)
      toast.error("Max 6 images")
      return
    }

    let geolocation = {}

    let location

    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${
          import.meta.env.VITE_GEOCODE_API_KEY
        }`
      )

      const data = await response.json()

      //se vier a null, fica a 0
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0
      location =
        data === "ZERO_RESULTS" ? undefined : data.results[0]?.formatted_address

      if (location === undefined || location.includes("undefined")) {
        setIsLoading(false)
        toast.error("Please corrent a correct address")
        return
      }
    } else {
      geolocation.lat = latitude
      geolocation.lng = longitude
    }

    //store images in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

        const storageRef = ref(storage, "images/" + filename)
        const uploadTask = uploadBytesResumable(storageRef, image)

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log("Upload is " + progress + "% done")
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused")
                break
              case "running":
                console.log("Upload is running")
                break
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error)
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            })
          }
        )
      })
    }

    const imageUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setIsLoading(false)
      toast.error("Images no uploaded")
      return
    })

    //console.log(imageUrls);

    /*
      Tratamento dos dados antes de ir para o fb
    */
    const formDataCopy = {
      ...formData,
      imageUrls,
      geolocation,
      timestamp: serverTimestamp(),
    }

    formDataCopy.location = address
    delete formDataCopy.images
    delete formDataCopy.address
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    console.log(formDataCopy)
    const docRef = await addDoc(collection(db, "listings"), formDataCopy)

    setIsLoading(false)
    toast.success("Listing saved")
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const onMutate = (e) => {
    //handle bool values
    let boolean = null

    if (e.target.value === "true") {
      boolean = true
    }

    if (e.target.value === "false") {
      boolean = false
    }

    //handle files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }))
    }

    //handle values
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value, //se for null usa o lado direito da condição
      }))
    }
  }

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid })
        } else {
          navigate("/sign-in")
        }
      })
    }
    //unmount
    return () => (isMounted.current = false)
  }, [isMounted])

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create a listing</p>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === "sale" ? "formButtonActive" : "formButton"}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === "rent" ? "formButtonActive" : "formButton"}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className="formLabel">Name</label>
          <input
            className="formInputName"
            type="text"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />

          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              className={parking ? "formButtonActive" : "formButton"}
              type="button"
              id="parking"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="parking"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? "formButtonActive" : "formButton"}
              type="button"
              id="furnished"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Address</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="address"
            value={address}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? "formButtonActive" : "formButton"}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              required
            />
            {type === "rent" && <p className="formPriceText">$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                className="formInputSmall"
                type="number"
                id="discountedPrice"
                value={discountedPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                required={offer}
              />
            </>
          )}

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )
}
