import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
// import DashboardPage from "./pages/DashboardPage";

function App() {
  const token = localStorage.getItem("token");
   //token is a string that is stored in the local storage of the browser, it is used to authenticate the user
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* <Route
          path="/dashboard"
          element={token ? <DashboardPage /> : <Navigate to="/login" />}
        /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
