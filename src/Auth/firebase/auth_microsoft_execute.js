import { getAuth, signInWithPopup, signInWithRedirect, OAuthProvider } from "firebase/auth";
import axios from 'axios';


export async function signinMicrosoft() {
  const auth = getAuth();
  const provider = new OAuthProvider('microsoft.com');

  try {
    const result = await  signInWithPopup(auth, provider);
    const user = result.user;
    
    // Extract user details
    const microsoftUserData = {
      name: user.displayName,
      email: user.email,
      socialMediaId: user.uid, 
      profilePic: user.photoURL
    };

    // Save to backend
    await saveMicrosoftUser(microsoftUserData);

  } catch (error) {
    console.error("Microsoft Sign-in failed:", error);
  }
}

async function saveMicrosoftUser(data) {
  try {
    const response = await axios.post("https://csuite-ui0f.onrender.com/api/user", data);
    console.log("User saved:", response.data);
  } catch (error) {
    console.error("Error saving Microsoft user:", error);
  }
}
