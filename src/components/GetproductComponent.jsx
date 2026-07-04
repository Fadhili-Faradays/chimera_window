import axios from "axios";
import { useEffect, useState, useContext, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { CATEGORIES } from "../constants/categories";
import ProductCard from "./ProductCard";

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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [category]);

    const categoryData = useMemo(() => {
      return category
        ? CATEGORIES.find((item) => item.value.toLowerCase() === category.toLowerCase()) || { label: category, description: "Browse products within this category." }
        : null;
    }, [category]);

    // Compute background URL for wrapper (CSS class handles positioning/sizing)
    const publicUrl = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
    const bgImage = category && categoryData?.bgImage ? categoryData.bgImage : "background.png";
    const bgUrl = `${publicUrl}/${bgImage}`;

    const groupedProducts = !category
      ? CATEGORIES.map((cat) => ({
          category: cat,
          products: filtered_products.filter(
            (product) => product.product_category?.toLowerCase() === cat.value.toLowerCase()
          ),
        })).filter((section) => section.products.length > 0)
      : [];

    const uncategorizedProducts = !category
      ? filtered_products.filter(
          (product) => !CATEGORIES.some(
            (cat) => product.product_category?.toLowerCase() === cat.value.toLowerCase()
          )
        )
      : [];

    // Handlers memoized to provide stable refs to ProductCard
    const handleToggleFavorite = useCallback((product) => {
      if (isFavorite(product.id)) {
        removeFromFavorites(product.id);
      } else {
        addToFavorites(product);
      }
    }, [addToFavorites, removeFromFavorites, isFavorite]);

    const handleAddToCart = useCallback((product) => {
      addToCart(product);
    }, [addToCart]);

    const handlePurchase = useCallback((product) => {
      navigator("/makepayment", { state: { product } });
    }, [navigator]);

    const bgStyle = { backgroundImage: `url('${bgUrl}')` };

    return(
      <div className="row justify-content-center mt-4 product-page-bg" style={bgStyle}>
            <div 
              className="category-banner p-4 mb-4 rounded-3 text-start" 
              style={categoryData && categoryData.bgColor ? {
                background: `linear-gradient(135deg, ${categoryData.bgColor}dd, ${categoryData.bgColor}99)`,
                color: "white"
              } : {}}
            >
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

            {category ? (
              filtered_products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  img_url={img_url}
                  isFavorite={isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                  onPurchase={handlePurchase}
                  auth={auth}
                />
              ))
            ) : (
              groupedProducts.map((section) => (
                <div className="col-12 mb-5" key={section.category.value}>
                  <div 
                    className="category-section-header p-3 mb-3 rounded-2"
                    style={section.category.bgColor ? {
                      background: `linear-gradient(135deg, ${section.category.bgColor}cc, ${section.category.bgColor}88)`,
                      color: "white"
                    } : {}}
                  >
                    <h4 className="fw-bold mb-2">{section.category.label}</h4>
                    <p className="mb-0 category-section-text">{section.category.description}</p>
                  </div>
                  <div className="row">
                    {section.products.map((product) => (
                      <ProductCard
                        key={`${section.category.value}-${product.id}`}
                        product={product}
                        img_url={img_url}
                        isFavorite={isFavorite}
                        onToggleFavorite={handleToggleFavorite}
                        onAddToCart={handleAddToCart}
                        onPurchase={handlePurchase}
                        auth={auth}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}

            {uncategorizedProducts.length > 0 && !category && (
              <div className="col-12 mb-5">
                <div className="mb-3">
                  <h4 className="fw-bold">Other</h4>
                  <p className="mb-2 text-muted">Products that do not match the defined category list.</p>
                </div>
                <div className="row">
                  {uncategorizedProducts.map((product) => (
                    <ProductCard
                      key={`other-${product.id}`}
                      product={product}
                      img_url={img_url}
                      isFavorite={isFavorite}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={handleAddToCart}
                      onPurchase={handlePurchase}
                      auth={auth}
                    />
                  ))}
                </div>
              </div>
            )}
        </div>
    )

}
export default GetproductComponent;