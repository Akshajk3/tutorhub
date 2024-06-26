import React, { useState }  from "react";
import icon from "../src/img/picture.png";
import {  createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage, db } from "./firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom"

const Register = () => {

    const [err, setErr] = useState(false);
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const displayName = e.target[0].value;
        const email = e.target[1].value;
        const password = e.target[2].value;
        const file = e.target[3].files[0];

        try{
            // Create the User
            const res = await createUserWithEmailAndPassword(auth, email, password);

            const date = new Date().getTime();
            const storageRef = ref(storage, `${displayName + date}`)

            await uploadBytesResumable(storageRef, file).then(() => {
                getDownloadURL(storageRef).then(async(downloadURL) => {
                    try{
                        // Update the Profile
                        await updateProfile(res.user, {
                            displayName,
                            photoURL : downloadURL,
                        });

                        await setDoc(doc(db, "users", res.user.uid), {
                            uid : res.user.uid,
                            displayName,
                            email,
                            photoURL : downloadURL
                        });

                        await setDoc(doc(db, "userChats", res.user.uid), {});
                        navigate("/");
                    } catch(err)
                    {
                        console.log(err);
                        setErr(true);
                    }
                })
            })
        } catch(err)
        {
            setErr(true);
        }
    };

    return (
        <div className="formContainer">
            <div className="formWrapper">
                <span className="logo">Tutor Finder</span>
                <span className="title">Register</span>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Display Name"/>
                    <input type="email" placeholder="Email"/>
                    <input type="password" placeholder="Password"/>
                    <input style={{display:"none"}} type="file" id="file"/>
                    <label htmlFor="file" placeholder="https://cdn-icons-png.flaticon.com/512/456/456212.png">
                        <img src={icon} alt="" />
                        <span>Add an avatar</span>
                    </label>
                    <button>Sign Up</button>
                    {err && <span>Something went wrong</span>}
                </form>
                <p>You do have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    )
}

export default Register;