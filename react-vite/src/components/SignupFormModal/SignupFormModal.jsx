import { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkSignup } from "../../redux/session";
import "./SignupForm.css";

function SignupFormModal() {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setErrors({ confirmPassword: "Confirm Password must match Password" });
    }

    const serverResponse = await dispatch(
      thunkSignup({
        email,
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        street_address: streetAddress,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      closeModal();
    }
  };

  return (
    <div className="signup-modal">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label>
          First Name
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          {errors.first_name && <p className="error">{errors.first_name}</p>}
        </label>

        <label>
          Last Name
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          {errors.last_name && <p className="error">{errors.last_name}</p>}
        </label>

        <label>
          Street Address
          <input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required />
          {errors.street_address && <p className="error">{errors.street_address}</p>}
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {errors.email && <p className="error">{errors.email}</p>}
        </label>

        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          {errors.username && <p className="error">{errors.username}</p>}
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {errors.password && <p className="error">{errors.password}</p>}
        </label>

        <label>
          Confirm Password
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
        </label>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignupFormModal;
