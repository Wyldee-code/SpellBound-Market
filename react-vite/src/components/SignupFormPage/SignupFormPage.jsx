import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { thunkSignup } from "../../redux/session";
import "./SignupForm.css";

function SignupFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sessionUser = useSelector((state) => state.session.user);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    streetAddress: "",
  });

  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setErrors({
        confirmPassword: "Confirm Password must match Password",
      });
    }

    const serverResponse = await dispatch(
      thunkSignup({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        street_address: formData.streetAddress,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="signup-page-wrapper">
      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit} className="signup-form">
        <div className="name-fields">
          <div className="input-group">
            <label>
              First Name
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </label>
            {errors.first_name && <p className="error">{errors.first_name}</p>}
          </div>

          <div className="input-group">
            <label>
              Last Name
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </label>
            {errors.last_name && <p className="error">{errors.last_name}</p>}
          </div>
        </div>

        <div className="input-group">
          <label>
            Street Address
            <input
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              required
            />
          </label>
          {errors.street_address && <p className="error">{errors.street_address}</p>}
        </div>

        <div className="input-group">
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div className="input-group">
          <label>
            Username
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>
          {errors.username && <p className="error">{errors.username}</p>}
        </div>

        <div className="input-group">
          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <div className="input-group">
          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>
          {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
        </div>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignupFormPage;
