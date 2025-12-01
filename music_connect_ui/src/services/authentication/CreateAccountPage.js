import './CreateAccountPage.css';
import musicConnectLogo from '../../files/music-connect-logo.png';
import TextField from '@mui/material/TextField';
import {useEffect, useState} from "react";
import {Alert, Button} from "@mui/material";
import {useNavigate} from "react-router";

const CreateAccountPage = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const createAccount = async () => {
        setLoading(true);

        if (username.length < 1 || password.length < 8) {
            setError(true);
        }
        else {
            // TODO call UserSlice to create account.

            if (!error) {
                setMessage("Account created. Please check your email to verify your account. Redirecting to login.");
                setTimeout(() => navigate("/login"), 2000);
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        if (error) {
            if (username === "" || password === "") {
                setMessage("Missing field");
            }
            else if (username.length < 1 || password.length < 8) {
                setMessage("Invalid username or password.");
            }
            else {
                setMessage("There was a problem creating your account. Please try again.");
            }
        }
    }, [error]);

    return (
        <div>
            <div className="auth-container">
                <img className={"logo"} src={musicConnectLogo} alt={`MusicConnect Logo`}/>
                <div className={"auth-wrapper"}>
                    <div className={"username-container"}>
                        <p className={"username-label"}>Enter Username:</p>
                        <TextField hiddenLabel id="username-field" size="small" placeholder={"Username"} sx={{ width: '60%' }} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <p className={"username-requirements"}>Your username must be at least 1 character.</p>
                    <div className={"password-container"}>
                        <p className={"password-label"}>Enter New Password:</p>
                        <div className={"password-label"}></div>
                        <TextField hiddenLabel id="password-field" size="small" type={"password"} placeholder={"Password"} sx={{ width: '60%' }} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <p className={"password-requirements"}>Your password must be at least 8 characters.</p>
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