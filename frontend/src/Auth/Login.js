import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import "./LoginPage.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Api from "../Api";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    const endpoint = isLogin ? "users/login" : "users/register";

    const payload = isLogin
      ? { email: data.email, password: data.password }
      : {
          username: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        };

    try {
      const response = await Api.post(endpoint, payload);
      console.log(response.data);

      if (isLogin) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userid", response.data.user._id);
        toast.success("Login successful!");
        setTimeout(() => {
          navigate("/todoList");
        }, 3000);
      } else {
        toast.success("Signup successful! Redirecting to login...");
        setTimeout(() => {
          setIsLogin(true);
          reset();
        }, 3000);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <div className="login-page">
      <Row className="vh-100">
        <Col
          md={6}
          className="left-panel d-none d-md-flex align-items-center justify-content-center"
        >
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/login-illustration-download-in-svg-png-gif-file-formats--account-password-security-lock-design-development-illustrations-2757111.png?f=webp"
            alt="Illustration"
            className="img-fluid"
            width="400"
          />
        </Col>

        <Col
          md={6}
          className="right-panel d-flex align-items-center justify-content-center"
        >
          <div className="login-box p-4 rounded shadow-sm">
            <div className="text-center mb-4">
              <FaUser size={40} className="mb-3" />
              <h4>{isLogin ? "User Login" : "User Signup"}</h4>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
              {!isLogin && (
                <Form.Group className="mb-3">
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <Form.Control
                      type="text"
                      placeholder="Full Name"
                      {...register("name", {
                        required: "Full name is required",
                      })}
                    />
                  </div>
                  {errors.name && (
                    <small className="text-danger">{errors.name.message}</small>
                  )}
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    {...register("email", { required: "Email is required" })}
                  />
                </div>
                {errors.email && (
                  <small className="text-danger">{errors.email.message}</small>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    {...register("password", {
                      required: "Password is required",
                      
                    })}
                  />
                </div>
                {errors.password && (
                  <small className="text-danger">
                    {errors.password.message}
                  </small>
                )}
              </Form.Group>

              {!isLogin && (
                <Form.Group className="mb-3">
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <Form.Control
                      type="password"
                      placeholder="Confirm Password"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (val) =>
                          val === watch("password") || "Passwords do not match",
                      })}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <small className="text-danger">
                      {errors.confirmPassword.message}
                    </small>
                  )}
                </Form.Group>
              )}

              {isLogin && (
                <div className="d-flex justify-content-between mb-3">
                  <Form.Check label="Remember me" />
                  <a href="/" className="forgot-link">
                    Forgot Password?
                  </a>
                </div>
              )}

              <Button type="submit" className="w-100 login-btn mb-2">
                {isLogin ? "LOGIN" : "SIGN UP"}
              </Button>
            </Form>

            <div className="text-center">
              {isLogin ? (
                <p>
                  Don’t have an account?{" "}
                  <button
                    className="toggle-btn"
                    onClick={() => setIsLogin(false)}
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    className="toggle-btn"
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          </div>
        </Col>
      </Row>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default LoginPage;
