import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from './services/authentication/AuthContext'
import  { PrivateRoute } from './services/authentication/PrivateRoute';
import './App.css';
import LoginPage from './services/authentication/Login';
import CreateAccountPage from "./services/authentication/CreateAccount";
import Dashboard from "./services/Dashboard";

function App() {

  return (
    <div className="App">
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/create-account" element={<CreateAccountPage />} />
                    <Route path="/" element={<Dashboard />} />
                    {/* authenticated routes
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<Dashboard />} />
                    </Route>
                     */}
                </Routes>
            </AuthProvider>
        </Router>
    </div>
  );
}

export default App;
