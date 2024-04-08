import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

function EditProductModal(props) {
  const { showModalEdit, setShowModalEdit, selectedProduct } = props;
  const [able, setAble] = useState(true);


  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    gallery: [],
    category_id: "",
  });

  const [categories, setCategories] = useState([]);
    // validation
    const validateForm = () => {
      for (const key in formData) {
        if (formData[key] === "") {
          // Trường ${key} đang rỗng
          return false;
        }
      }
      return true;
    };
  
    // Sử dụng validateForm để kiểm tra khi cần
    const isFormValid = validateForm();

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name || "",
        price: selectedProduct.price || "",
        quantity: selectedProduct.quantity || "",
        description: selectedProduct.description || "",
        gallery: selectedProduct.gallery || [],
        category_id: selectedProduct.category_id || "",
      });
    }

    const fetchCategories = async () => {
      try {
        
        const response = await axios.get("https://api-treeshop.onrender.com/category");
        const data = response.data;
        if (data.status) {
          setCategories(data.categories);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [selectedProduct]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "gallery" && files.length > 0) {
      setAble(false)
      // const uploadedImages = [];
      const uploaders = Array.from(files).map((file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "t9fgxqpw");
        return axios.post(
          `https://api.cloudinary.com/v1_1/dcb2afzz4/image/upload`,
          data
        );
      });
  
      Promise.all(uploaders)
        .then((responses) => {
          const newGallery = responses.map((response) => response.data.url);
          setFormData((prevFormData) => ({
            ...prevFormData,
            gallery: newGallery,
          }));
          setAble(true)
        })
        .catch((error) => {
          console.error("Error uploading images:", error);
        });
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
  
  const handleSave = async (e) => {
    // e.preventDefault();
    try {
      if (!isFormValid) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please enter complete information",
        });
        return;
      }
      const response = await axios.patch(
        `https://api-treeshop.onrender.com/product/edit/${selectedProduct._id}`,
        formData
      );
      const data = response.data;
      if (data.status) {
       
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          title: "Update product successfully",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1300);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:  error.response.data.message,
      });
    }
  };
  
  

  return (
    <>
      {showModalEdit && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Information</h5>
                <button type="button" className="btn-close" onClick={() => setShowModalEdit(false)}></button>
              </div>
              <div className="modal-body">
                <div className="container">
                  <form>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="price" className="form-label">Price</label>
                      <input type="number" className="form-control" id="price" name="price" value={formData.price} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="quantity" className="form-label">Quantity</label>
                      <input type="number" className="form-control" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea className="form-control" id="description" name="description" rows="3" value={formData.description} onChange={handleChange} required></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="gallery" className="form-label">Gallery</label>
                      <input type="file" className="form-control" id="gallery" name="gallery" multiple onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="category_id" className="form-label">Category</label>
                      <select className="form-select" id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required>
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                  </form>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModalEdit(false)}>Close</button>
                <button type="button"
                 className="btn btn-primary" 
                 onClick={handleSave}
                 disabled={!able}
                 >
                  Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditProductModal;
