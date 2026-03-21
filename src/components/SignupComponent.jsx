import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

const SignupComponent =()=>{
    let [username, updateUsername]=useState("") 
    let [email, updateEmail]= useState("") 
    let [phonenumber, updatePhonenumber]=useState("")
    let [password, updatePassword] =useState("")

    let [loading,updateLoading] =useState("")
    let [success,updateSuccess] =useState("")
    let [error,updateError] =useState("")

    let handleSubmit= async (e)=>{
        
        e.preventDefault();
 
        updateError("");
        updateSuccess("");
        updateLoading("Submitting data. Please wait ...")

        console.log(username, email, phonenumber, password)
 
        try {
            const user_data = new FormData()
            user_data.append("username", username)
            user_data.append("email", email)
            user_data.append("phonenumber", phonenumber)
            user_data.append("password", password);

            // use axios to send data to server 
           const response = await axios.post(
            "https://faradays.alwaysdata.net/api/signup",user_data);

           console.log(response);
           if(response.status === 200){
            updateSuccess(response.data.message);
            updateLoading("");
            updateUsername("")
            updateEmail("")
            updatePhonenumber("")
            updatePassword("")

           }
        } catch (error) {
            console.log(error);
            updateLoading("");
            updateError(error.message);
        }
    };

    return(
        <div className="row justify-content-center mt-4">
            <div className="col-md-6 card shadow p-4">
                <h2>Sign Up</h2>

                <h5 className="text-warning">{loading}</h5>
                <h5 className="text-danger">{error}</h5>
                <h5 className="text-success">{success}</h5>
                <form onSubmit={handleSubmit}>
                    <input 
                    className="form-control"
                    type="text"
                    placeholder="Enter Username"
                    required
                    value={username} 
                    onChange={(e)=>{
                        updateUsername(e.target.value)
                    }}
                    /> <br />
                    
                    <input 
                    type="email"
                    className="form-control"  
                    placeholder="Enter Email"
                    required
                    value={email}
                    onChange={(e)=>{
                        updateEmail(e.target.value)
                    }}
                    /> <br />
                    <input 
                    type="number"
                    className="form-control"  
                    placeholder="Enter Phone Number"
                    required
                    value={phonenumber}
                    onChange={(e)=>{
                        updatePhonenumber(e.target.value)
                    }}
                    /> <br />
                    <input 
                    type="password" 
                    className="form-control"
                    placeholder="Enter Password"
                    required
                    value={password}
                    onChange={(e)=>{
                        updatePassword(e.target.value)
                    }}
                    /> <br />
                    
                    <button className="btn btn-success">
                        Sign Up
                    </button> <br />

                    <Link to= "/signin">Already have an account? Sign In</Link>
                </form>
            </div>
            
        </div>
    );
}
export default SignupComponent;