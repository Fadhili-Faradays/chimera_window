import axios from "axios";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const MakepaymentComponent =()=>{

    const location = useLocation();
    const { product, cart } = location.state || {};
    
    const img_url = "https://dmuturi.alwaysdata.net/static/images/";
    
    let [phone, setPhone]= useState("");
    let[loading,setLoading]=useState("");
    let[error,setError]=useState("");
    let[success,setSuccess]=useState("");

    const isCart = cart && cart.length > 0;
    const items = isCart ? cart : [product];
    const totalAmount = isCart ? cart.reduce((sum, item) => sum + parseFloat(item.product_cost) * item.quantity, 0) : parseFloat(product.product_cost);

    const handleSubmit =async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(" Please wait ...");
        try {
            const data = new FormData();

            data.append("amount", totalAmount);
            data.append("phone", phone);

            const response = await axios.post(
                "https://faradays.alwaysdata.net/api/mpesa_payment",
                data
            );
            console.log(response);

            if(response.status===200){
                setLoading("");
                setSuccess(response.data.message);
                setPhone("");
            }
        } catch (error) {
            setLoading("")
            setError(error.message)
        }
    }

    return(
        <div className="row justify-content-center mt-4" >
            <h2>Lipa na Mpesa</h2>
            {items.map((item, index) => (
                <div key={index} className="col-md-3 mb-3">
                    <img 
                    src={img_url + item.product_image} 
                    alt="" 
                    className="rounded img-thumbnail" />
                    <h3 className="text-dark">{item.product_name}</h3>
                    <h3 className="text-primary">{item.product_category}</h3>
                    <p className="text-muted">{item.product_description}</p>
                    <h3 className="text-warning">{item.product_cost}</h3>
                    {isCart && <p>Quantity: {item.quantity}</p>}
                </div>
            ))}
            <div className="col-md-12 text-center">
                <h3>Total: {totalAmount}</h3>
                <hr />
                 
                 <h6 className="text-warning">{loading}</h6>
                 <h6 className="text-danger">{error}</h6>
                 <h6 className="text-success">{success}</h6>
                <form onSubmit={handleSubmit}>
                    <input 
                    type="text"
                    className="form-control"
                    placeholder="Enter Amount"
                    readOnly
                    value={totalAmount}
                     />
                     <input 
                     type="tel"
                     className="form-control"
                     placeholder="Enter Mpesa No 2547XXXXXXXX"
                     onChange={ (e) => {
                        setPhone(e.target.value);                       
                     }}
                      />
                        <br />
                      <button className="btn btn-dark">Pay Now</button>
                </form>
            </div>
        </div>
    )
}
export default MakepaymentComponent;