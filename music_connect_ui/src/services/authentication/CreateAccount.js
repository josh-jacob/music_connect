import './CreateAccount.css';
import musicConnectLogo from '../../files/music-connect-logo.png';
import TextField from '@mui/material/TextField';
import { useState } from "react";
import {Alert, Button} from "@mui/material";
import {useNavigate} from "react-router";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCoffee } from '@fortawesome/free-solid-svg-icons';

const CreateAccountPage = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const createAccount = async () => {
        setLoading(true);
        setError(false);

        // call UserSlice to create account.

        if (error) {
            setError(true);
            setMessage("There was a problem creating your account. Please try again.");
        }
        else {
            setMessage("Account created. Redirecting to login.");
            setTimeout(() => navigate("/music-connect/login"), 2000);
        }
        setLoading(false);
    }

    return (
        <div>
            <div className="auth-container">
                <img className={"logo"} src={musicConnectLogo} alt={`MusicConnect Logo`}/>
                <div className={"auth-wrapper"}>
                    {/* <FontAwesomeIcon icon={faCoffee} style={{ color: '#6f4e37', marginLeft: '8px' }} /> */}
                    <div className={"username-container"}>
                        <p className={"username-label"}>Enter Username:</p>
                        <TextField hiddenLabel id="username-field" size="small" placeholder={"Username"} sx={{ width: '60%' }} />
                    </div>
                    <div className={"password-container"}>
                        <p className={"password-label"}>Enter New Password:</p>
                        <div className={"password-label"}></div>
                        <TextField hiddenLabel id="password-field" size="small" type={"password"} placeholder={"Password"} sx={{ width: '60%' }} />
                    </div>
                </div>
                <div className={"auth-footer"}>
                    {message !== "" ? <Alert severity={error ? "error" : "success"}>{message}</Alert> : null}
                    <Button className={"create-account-button"} variant="contained" loading={loading} loadingIndicator="Loading…" sx={{ backgroundColor: "#20B654", color: "white", width: "100px" }} onClick={createAccount}>Create</Button>
                </div>
            </div>
        </div>
    );
}

export default CreateAccountPage;