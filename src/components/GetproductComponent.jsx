import axios from "axios";
import { use, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const GetproductComponent = ()=>{

    let[products,setProducts]=useState([]);
    let[loading,setLoading]=useState("");
    let[error,setError]=useState("");
    

    let [shirts,setShirts] = useState([]);
    let [tshirts,setTshirts] = useState([]);
    let [jackets,setJackets] = useState([]);
    let [trousers,setTrousers] = useState([]);
    let [shoes,setShoes] = useState([]);

    let [search_word,setSearchWord] = useState("");
    let [filtered_products, setFilteredProducts] = useState([]);

    // base url for  images from server
   
    const img_url = "https://faradays.alwaysdata.net/static/images/"
 
    let navigator =useNavigate();
    const { addToCart } = useContext(CartContext);

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

                let shirts_products = response.data.filter((product)=> product.product_category === "Shirts");
                setShirts(shirts_products);

                let tshirts_products = response.data.filter((product)=> product.product_category === "T-Shirts");
                setTshirts(tshirts_products);               

                let jackets_products = response.data.filter((product)=> product.product_category === "Jackets");
                setJackets(jackets_products)

                let trousers_products = response.data.filter((product)=> product.product_category === "Trousers");
                setTrousers(trousers_products)

                let shoes_products = response.data.filter((product)=> product.product_category === "Shoes");
                setShoes(shoes_products)
            }
        } catch (error) {
            setLoading("")
            setError(error.message)
        }
        
    };
    useEffect(()=>{
        getProducts();
    },[])

    const handleSearch = (e)=>{
        let filterProducts = products.filter((product)=> 
            product.product_name.includes(search_word))
        setFilteredProducts(filterProducts);
    };

    useEffect(()=>{
        handleSearch(search_word);
    },[search_word]);

    return(
        <div className="row justify-content-center mt-4">
            <h3>Available products</h3>
            <h6 className="text-warning">{loading}</h6>
            <h6 className="text-danger">{error}</h6>


            <input 
            type="text"
            className="form-control mb-4"
            placeholder="Search product"
            value={search_word} />
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
                        <button className="btn btn-primary me-2" 
                        onClick={() => addToCart(product)}>
                        Add to Cart</button>
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