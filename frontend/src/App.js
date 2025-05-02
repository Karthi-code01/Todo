import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginPage from "./Auth/Login";
import { Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Todo from "./Dashboard/Todo";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />}></Route>
        <Route
          path="/todoList"
          element={
            <ProtectedRoute>
              <Todo />
            </ProtectedRoute>
          }
        ></Route>
      </Routes>
    </div>
  );
}

export default App;
