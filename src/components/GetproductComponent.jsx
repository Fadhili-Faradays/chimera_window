import axios from "axios";
import { useEffect, useState, useContext, useMemo } from "react";
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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [category]);

    const categoryData = useMemo(() => {
      return category
        ? CATEGORIES.find((item) => item.value.toLowerCase() === category.toLowerCase()) || { label: category, description: "Browse products within this category." }
        : null;
    }, [category]);

    // Update background image based on category
    useEffect(() => {
        const bgImage = category && categoryData?.bgImage 
            ? categoryData.bgImage 
            : "background.png";
        document.body.style.backgroundImage = `url('/public/${bgImage}')`;
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.backgroundPosition = "center center";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundRepeat = "no-repeat";

        // Cleanup on unmount
        return () => {
            document.body.style.backgroundImage = "url('/public/background.png')";
        };
    }, [category, categoryData]);

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

    return(
        <div className="row justify-content-center mt-4">
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
                <div className="col-md-3 justify-content-center mb-4" key={product.id}>
                  <div className="card shadow card-margin">
                    <img src={img_url + product.product_image} alt="" className="product_img mt-4" />
                    <div className="card-body">
                      <h5 className="mt-2">{product.product_name}</h5>
                      <p className="text-muted">{product.product_description}</p>
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
                          <button className="btn btn-primary me-2" onClick={() => addToCart(product)}>
                            Add to Cart
                          </button>
                          <button
                            className="btn btn-dark"
                            onClick={() => {
                              navigator("/makepayment", { state: { product } });
                            }}
                          >
                            Purchase Now
                          </button>
                        </>
                      )}
                      {auth.role === 'employee' && (
                        <p className="text-info">Employee View - Product Management</p>
                      )}
                    </div>
                  </div>
                </div>
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
                      <div className="col-md-3 justify-content-center mb-4" key={`${section.category.value}-${product.id}`}>
                        <div className="card shadow card-margin">
                          <img src={img_url + product.product_image} alt="" className="product_img mt-4" />
                          <div className="card-body">
                            <h5 className="mt-2">{product.product_name}</h5>
                            <p className="text-muted">{product.product_description}</p>
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
                                <button className="btn btn-primary me-2" onClick={() => addToCart(product)}>
                                  Add to Cart
                                </button>
                                <button
                                  className="btn btn-dark"
                                  onClick={() => {
                                    navigator("/makepayment", { state: { product } });
                                  }}
                                >
                                  Purchase Now
                                </button>
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
                    <div className="col-md-3 justify-content-center mb-4" key={`other-${product.id}`}>
                      <div className="card shadow card-margin">
                        <img src={img_url + product.product_image} alt="" className="product_img mt-4" />
                        <div className="card-body">
                          <h5 className="mt-2">{product.product_name}</h5>
                          <p className="text-muted">{product.product_description}</p>
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
                              <button className="btn btn-primary me-2" onClick={() => addToCart(product)}>
                                Add to Cart
                              </button>
                              <button
                                className="btn btn-dark"
                                onClick={() => {
                                  navigator("/makepayment", { state: { product } });
                                }}
                              >
                                Purchase Now
                              </button>
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
              </div>
            )}
        </div>
    )

}
export default GetproductComponent;