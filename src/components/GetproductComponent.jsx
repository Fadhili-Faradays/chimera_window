import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { CATEGORIES } from "../constants/categories";

const GetproductComponent = ()=>{

    let[products,setProducts]=useState([]);
    let[loading,setLoading]=useState("");
    let[error,setError]=useState("");
    

    let [search_word,setSearchWord] = useState("");
    let [filtered_products, setFilteredProducts] = useState([]);

    const { category } = useParams();

    // base url for  images from server
   
    const img_url = "https://faradays.alwaysdata.net/static/images/"
 
    let navigator =useNavigate();
    const { addToCart } = useContext(CartContext);
    const { auth } = useContext(AuthContext);
    const { addToFavorites, removeFromFavorites, isFavorite } = useContext(FavoritesContext);

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
        let filterProducts = products;

        if (category) {
            filterProducts = filterProducts.filter((product) =>
                product.product_category?.toLowerCase() === category.toLowerCase()
            );
        }

        filterProducts = filterProducts.filter((product)=> 
            product.product_name.toLowerCase().includes(search_word.toLowerCase())
        );

        setFilteredProducts(filterProducts);
    },[search_word, products, category]);

    const categoryData = category
      ? CATEGORIES.find((item) => item.value.toLowerCase() === category.toLowerCase()) || { label: category, description: "Browse products within this category." }
      : null;

    return(
        <div className="row justify-content-center mt-4">
            <div className="category-banner p-4 mb-4 rounded-3 text-start">
              <h3 className="fw-bold mb-2">
                {categoryData ? `Category: ${categoryData.label}` : "Available products"}
              </h3>
              <p className="mb-2 category-banner-text">
                {categoryData ? categoryData.description : "Browse all products and explore categories to find what you need."}
              </p>
              {categoryData && (
                <Link to="/" className="btn btn-sm btn-outline-light">
                  View all products
                </Link>
              )}
            </div>
            <h6 className="text-warning">{loading}</h6>
            <h6 className="text-danger">{error}</h6>


            <input 
            type="text"
            className="form-control mb-4"
            placeholder="Search product"
            value={search_word}
            onChange={(e) => setSearchWord(e.target.value)} />
            {filtered_products.length === 0 && !loading && (
              <div className="alert alert-info mt-3">
                No products found{categoryData ? ` in ${categoryData.label}` : ''}.
              </div>
            )}
            {filtered_products.map((product)=>(
                <div className="col-md-3 justify-content-center mb-4">
                <div className=" card shadow  card-margin">
                    <img src={img_url+product.product_image} alt="" className="product_img mt-4" />
                    <div className="card-body">
                        <h5 className="mt-2">{product.product_name}</h5>
                        <p className="text-muted">{product.product_description}</p>
                        <p className="text-info">Sold by: {product.seller_name || 'Unknown Seller'}</p>
                        <b className="text-warning">{product.product_cost}</b>
                        <br />
                        <br />
                        <button
                            className={`btn me-2 ${isFavorite(product.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => {
                                if (isFavorite(product.id)) {
                                    removeFromFavorites(product.id);
                                } else {
                                    addToFavorites(product);
                                }
                            }}
                        >
                            {isFavorite(product.id) ? '❤️ Favorited' : '🤍 Add to Favorites'}
                        </button>
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