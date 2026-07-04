import React from 'react';

const ProductCard = ({ product, img_url, isFavorite, onToggleFavorite, onAddToCart, onPurchase, auth }) => {
  return (
    <div className="col-md-3 justify-content-center mb-4">
      <div className="card shadow card-margin product-card">
        <img src={img_url + product.product_image} alt={product.product_name || 'Product image'} className="product_img mt-4" loading="lazy" />
        <div className="card-body">
          <h5 className="mt-2">{product.product_name}</h5>
          <p className="text-muted">{product.product_description}</p>
          <b className="text-warning">{product.product_cost}</b>
          <br />
          <br />
          <button
            type="button"
            aria-label={isFavorite(product.id) ? `Unfavorite ${product.product_name}` : `Add ${product.product_name} to favorites`}
            className={`btn me-2 ${isFavorite(product.id) ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => onToggleFavorite(product)}
          >
            {isFavorite(product.id) ? '❤️ Favorited' : '🤍 Add to Favorites'}
          </button>
          <br />
          <br />
          {auth.role === 'user' && (
            <>
              <button type="button" aria-label={`Add ${product.product_name} to cart`} className="btn btn-primary me-2" onClick={() => onAddToCart(product)}>
                Add to Cart
              </button>
              <button
                type="button"
                aria-label={`Purchase ${product.product_name} now`}
                className="btn btn-dark"
                onClick={() => onPurchase(product)}
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
  );
};

export default React.memo(ProductCard);
