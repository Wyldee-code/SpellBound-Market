import { useState } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await dispatch(thunkLogin({ email, password }));

    if (response) {
      setErrors(response);
    } else {
      closeModal();
    }
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    const response = await dispatch(
      thunkLogin({
        email: "demo@aa.io",
        password: "password",
      })
    );

    if (response) {
      setErrors(response);
    } else {
      closeModal();
    }
  };

  return (
    <div className="login-modal-wrapper">
      <div className="login-modal">
        <h1>Log In</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <p>{errors.email}</p>}
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <p>{errors.password}</p>}
          </label>

          <button type="submit" className="login-modal-button">
            Log In
          </button>
          <button
            type="button"
            className="demo-login-button"
            onClick={handleDemoLogin}
          >
            Demo Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginFormModal;
