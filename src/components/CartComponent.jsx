import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const CartComponent = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + parseFloat(item.product_cost) * item.quantity, 0);

  return (
    <div className="container mt-4">
      <h3>Your Cart</h3>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="card mb-3">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5>{item.product_name}</h5>
                  <p>{item.product_description}</p>
                  <p>Price: {item.product_cost}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <button className="btn btn-danger" onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <h4>Total: ${total.toFixed(2)}</h4>
          <button className="btn btn-success me-2" onClick={() => navigate("/makepayment", { state: { cart } })}>
            Checkout
          </button>
          <button className="btn btn-secondary" onClick={clearCart}>
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
};

export default CartComponent;