import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const GetproductComponent = ()=>{

    let[products,setProducts]=useState([]);
    let[loading,setLoading]=useState("");
    let[error,setError]=useState("");
    

    let [search_word,setSearchWord] = useState("");
    let [filtered_products, setFilteredProducts] = useState([]);

    // base url for  images from server
   
    const img_url = "https://faradays.alwaysdata.net/static/images/"
 
    let navigator =useNavigate();
    const { addToCart } = useContext(CartContext);
    const { auth } = useContext(AuthContext);

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
                setFilteredProducts(response.data);
            }
        } catch (error) {
            setLoading("")
            setError(error.message)
        }
        
    };
    useEffect(()=>{
        getProducts();
    },[])

    useEffect(()=>{
        let filterProducts = products.filter((product)=> 
            product.product_name.toLowerCase().includes(search_word.toLowerCase()))
        setFilteredProducts(filterProducts);
    },[search_word, products]);

    return(
        <div className="row justify-content-center mt-4">
            <h3>Available products</h3>
            <h6 className="text-warning">{loading}</h6>
            <h6 className="text-danger">{error}</h6>


            <input 
            type="text"
            className="form-control mb-4"
            placeholder="Search product"
            value={search_word}
            onChange={(e) => setSearchWord(e.target.value)} />
            {filtered_products.map((product)=>(
                <div className="col-md-3 justify-content-center mb-4">
                <div className=" card shadow  card-margin">
                    <img src={img_url+product.product_image} alt="" className="product_img mt-4" />
                    <div className="card-body">
                        <h5 className="mt-2">{product.product_name}</h5>
                        <p className="text-muted">{product.product_description}</p>
                        <b className="text-warning">{product.product_cost}</b>
                        <br />
                        <br />
                        {auth.role === 'user' && (
                          <>
                            <button className="btn btn-primary me-2" 
                            onClick={() => addToCart(product)}>
                            Add to Cart</button>
                            <button className="btn btn-dark" 
                            onClick={()=>{navigator("/makepayment",{state: { product } });
                            }}>
                            Purchase Now</button>
                          </>
                        )}
                        {auth.role === 'employee' && (
                          <p className="text-info">Employee View - Product Management</p>
                        )}
                    </div>
                </div>
            </div>
            ))}
            
        </div>
    )

}
export default GetproductComponent;