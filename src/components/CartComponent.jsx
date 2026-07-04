import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const CartComponent = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const img_url = "https://faradays.alwaysdata.net/static/images/";

  const total = cart.reduce((sum, item) => sum + parseFloat(item.product_cost) * item.quantity, 0);

  return (
    <div className="container mt-4">
      <h3>Your Cart</h3>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => {
            const imageUrl = item.product_image?.startsWith("http")
              ? item.product_image
              : item.product_image
              ? `${img_url}${item.product_image}`
              : "https://via.placeholder.com/160x160?text=No+Image";

            return (
              <div key={item.id} className="card mb-3">
                <div className="row g-0 align-items-center">
                  <div className="col-md-3 text-center p-3">
                    <img
                      src={imageUrl}
                      alt={item.product_name || "Cart item image"}
                      className="img-fluid rounded"
                      style={{ maxHeight: 160, objectFit: "contain" }}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = "https://via.placeholder.com/160x160?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="col-md-7">
                    <div className="card-body">
                      <h5 className="card-title">{item.product_name}</h5>
                      <p className="card-text mb-2">{item.product_description}</p>
                      <p className="card-text mb-1"><strong>Price:</strong> ${parseFloat(item.product_cost || 0).toFixed(2)}</p>
                      <p className="card-text mb-1"><strong>Quantity:</strong> {item.quantity}</p>
                      <p className="card-text mb-0"><strong>Subtotal:</strong> ${(parseFloat(item.product_cost || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="col-md-2 d-flex justify-content-center align-items-center p-3">
                    <button
                      type="button"
                      aria-label={`Remove ${item.product_name} from cart`}
                      className="btn btn-danger"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
            <h4 className="mb-3 mb-sm-0">Total: ${total.toFixed(2)}</h4>
            <div>
              <button
                type="button"
                aria-label="Proceed to checkout"
                className="btn btn-success me-2 mb-2 mb-sm-0"
                onClick={() => navigate("/makepayment", { state: { cart } })}
              >
                Checkout
              </button>
              <button
                type="button"
                aria-label="Clear cart"
                className="btn btn-secondary"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartComponent;
