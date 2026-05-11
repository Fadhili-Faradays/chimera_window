import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const EmployeeCatalogueComponent = () => {
    let [products, setProducts] = useState([]);
    let [loading, setLoading] = useState("");
    let [error, setError] = useState("");

    const img_url = "https://faradays.alwaysdata.net/static/images/";
    const { auth } = useContext(AuthContext);
    const navigator = useNavigate();

    const getProducts = async () => {
        setError("");
        setLoading("Fetching your products. Please wait ...");

        try {
            const response = await axios.get("https://faradays.alwaysdata.net/api/get_products");
            console.log(response);

            if (response.status === 200) {
                setLoading("");
                // Filter products to only show those sold by the current employee
                const employeeProducts = response.data.filter(product => product.employee_id === auth.user.id);
                setProducts(employeeProducts);
            }
        } catch (error) {
            setLoading("");
            setError(error.message);
        }
    };

    useEffect(() => {
        if (auth.role === 'employee') {
            getProducts();
        }
    }, [auth]);

    return (
        <div className="row justify-content-center mt-4">
            <div className="category-banner p-4 mb-4 rounded-3 text-start">
                <h3 className="fw-bold mb-2">My Product Catalogue</h3>
                <p className="mb-2 category-banner-text">
                    View and manage the products you are selling.
                </p>
            </div>
            <h6 className="text-warning">{loading}</h6>
            <h6 className="text-danger">{error}</h6>

            {products.length === 0 && !loading && (
                <div className="alert alert-info mt-3">
                    You haven't added any products yet.
                </div>
            )}
            {products.map((product) => (
                <div className="col-md-3 justify-content-center mb-4" key={product.product_id}>
                    <div className="card shadow card-margin">
                        <img src={img_url + product.product_image} alt="" className="product_img mt-4" />
                        <div className="card-body">
                            <h5 className="mt-2">{product.product_name}</h5>
                            <p className="text-muted">{product.product_description}</p>
                            <b className="text-warning">{product.product_cost}</b>
                            <br />
                            <br />
                            <button
                                className="btn btn-primary me-2"
                                onClick={() => navigator("/addproduct")}
                            >
                                Add New Product
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EmployeeCatalogueComponent;