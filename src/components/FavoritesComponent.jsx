import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FavoritesContext } from "../context/FavoritesContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const FavoritesComponent = () => {
    const { favorites, removeFromFavorites } = useContext(FavoritesContext);
    const { addToCart } = useContext(CartContext);
    const { auth } = useContext(AuthContext);
    const navigator = useNavigate();

    // base url for images from server
    const img_url = "https://faradays.alwaysdata.net/static/images/";

    return (
        <div className="row justify-content-center mt-4">
            <h3>Your Favorite Products</h3>
            {favorites.length === 0 ? (
                <p className="text-muted">No favorite products yet. Start adding some!</p>
            ) : (
                favorites.map((product) => (
                    <div key={product.id} className="col-md-3 justify-content-center mb-4">
                        <div className="card shadow card-margin">
                            <img src={img_url + product.product_image} alt="" className="product_img mt-4" />
                            <div className="card-body">
                                <h5 className="mt-2">{product.product_name}</h5>
                                <p className="text-muted">{product.product_description}</p>
                                <b className="text-warning">{product.product_cost}</b>
                                <br />
                                <br />
                                <button
                                    className="btn btn-danger me-2"
                                    onClick={() => removeFromFavorites(product.id)}
                                >
                                    Remove from Favorites
                                </button>
                                {auth.role === 'user' && (
                                    <>
                                        <button
                                            className="btn btn-primary me-2"
                                            onClick={() => addToCart(product)}
                                        >
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
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default FavoritesComponent;