import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";

import { toast } from "react-toastify";
import GoogleIcon from "../assets/svg/googleIcon.svg";

export default function OAuth() {
  const navigate = useNavigate();
  const location = useLocation();

  const onGoogleClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      //check user
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      //create if doent exist
      if (!docSnap.exists()) {
        setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Could not authorize with Google");
    }
  };

  return (
    <div className="socialLogin">
      <p>Sign {location.pathname == "/sign-up" ? "up" : "in"} with </p>
      <button className="socialIconDiv" onClick={onGoogleClick}>
        <img src={GoogleIcon} alt="google" className="socialIconImg" />
      </button>
    </div>
  );
}
