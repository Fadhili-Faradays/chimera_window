import axios from "axios";
import { useState } from "react";

const AddproductComponent =()=>{
    let [product_name, setProductName] = useState("");
    let [product_cost, setProductCost] = useState("");
    let [product_category, setProductCategory] = useState("");
    let [product_description, setProductDescripton] = useState("");;
    let [product_image, setProductImage] = useState("");
    
    let[loading,setLoading] = useState("");
    let [success,setSuccess] = useState("");
    let[error,setError] = useState("");

    const handleSubmit = async (e) => {
        
        e.preventDefault();
 
        setError("");
        setSuccess("");
        setLoading("Submitting data. Please wait ...")

        try {
            const product_data = new FormData()
            product_data.append("product_name",product_name)
            product_data.append("product_cost",product_cost)
            product_data.append("product_category",product_category)
            product_data.append("product_description",product_description)
            product_data.append("product_image",product_image)
            
            const response = await axios.post(
                "https://dmuturi.alwaysdata.net/api/add_product", product_data
            )
            console.log(response)
            if (response.status===200)
                setSuccess(response.data.message)
                setLoading("")            
                setError("")

        } catch (error) {
            console.log (error.message)
            setLoading("")
            setError(error.message)

        }
    }
    return(
        <div className = "row justify-content-center mt-4">
            <div className = "col-md-6 card shadow p-4">
                <h2>Add Product</h2>
                
                <h5 className="text-danger">{error}</h5>
                <h5 className="text-success">{success}</h5>
                <h5 className="text-warning">{loading}</h5>
                
                <form  onSubmit={handleSubmit}>
                    <input 
                     type = "text"
                     className = "form-control" 
                     placeholder = "Input Product Name"
                     value={product_name}
                     onChange={(e)=>{
                        setProductName(e.target.value)
                    }}
                      />
                      <br />

                    <input 
                    type = "number"
                    className = "form-control"
                    placeholder = "Input Product Cost"
                    value={product_cost}
                    onChange={(e)=>{
                        setProductCost(e.target.value)
                    }}
                      />
                    <br />

                    <select 
                    className="form-control"
                    value={product_category}
                     onChange={(e)=>{
                        setProductCategory(e.target.value)
                     }}
                    >
                        <option value="">Select Category</option>
                        <option value="televisions">Electronics</option>
                        <option value="phones">Phones</option>
                        <option value="laptops">Laptops</option>
                        <option value="accessories">Accessoriess</option>
                         
                    </select>
                    <br />

                    <textarea  
                    rows="5"
                    placeholder="Input Product Description"
                    className="form-control"
                    value={product_description}
                     onChange={(e)=>{
                        setProductDescripton(e.target.value)
                    }}
                    >

                    </textarea>
                    <br />
                    
                    <label 
                    htmlFor=""
                    className="form-label"
                    
                    >
                        Product Image
                    </label>
                    <input 
                
                    type="file"
                    accept="image/*"
                    className="form-control"
                    
                     onChange={(e)=>{
                        setProductImage(e.target.files[0])
                    }} 
                    />
                    <br />

                    <button className="btn btn-success">Submit </button>
                </form>
            </div>

        </div>
    );
}
export default AddproductComponent;