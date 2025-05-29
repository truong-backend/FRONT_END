import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/  " element={<UserLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
