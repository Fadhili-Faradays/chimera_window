import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GetproductComponent = ()=>{

    let[products,setProducts]=useState([]);
    let[loading,setLoading]=useState("");
    let[error,setError]=useState("");
    // base url for  images from server

    const img_url = "https://faradays.alwaysdata.net/static/images/"
 
    let navigator =useNavigate();

//create function to fetch products from backend api

    const getProducts= async (e) => {
        setError("")
        setLoading("Fetching products. Please wait ...")

        try {
            const response = await axios.get("https://faradays.alwaysdata.net/api/get_products")
            console.log(response)

            if(response.status===200){
                setLoading("");
                setProducts(response.data);
            }
        } catch (error) {
            setLoading("")
            setError(error.message)
        }
        
    };
    useEffect(()=>{
        getProducts();
    },[])


    return(
        <div className="row ">
            <h3>Available products</h3>
            <h6 className="text-warning">{loading}</h6>
            <h6 className="text-danger">{error}</h6>
            {products.map((product)=>(
                <div className="col-md-3 justify-content-center mb-4">
                <div className=" card shadow  card-margin">
                    <img src={img_url+product.product_image} alt="" className="product_img mt-4" />
                    <div className="card-body">
                        <h5 className="mt-2">{product.product_name}</h5>
                        <p className="text-muted">{product.product_description}</p>
                        <b className="text-warning">{product.product_cost}</b>
                        <br />
                        <br />
                        <button className="btn btn-dark" 
                        onClick={()=>{navigator("/makepayment",{state: { product } });
                        }}>
                        Purchase Now</button>
                    </div>
                </div>
            </div>
            ))}
        </div>
    )

}
export default GetproductComponent;