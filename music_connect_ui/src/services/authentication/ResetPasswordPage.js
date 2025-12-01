import "./ResetPasswordPage.css";
import musicConnectLogo from "../../files/music-connect-logo.png";
import TextField from "@mui/material/TextField";
import {Alert, Button} from "@mui/material";
import {useNavigate} from "react-router";
import {useEffect, useState} from "react";

const ResetPasswordPage = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [checkPassword, setCheckPassword] = useState("");
    const [message, setMessage] = useState("");

    const resetPassword = async () => {
        setLoading(true);

        if (password !== checkPassword) {
            setError(true);
        }
        else {
            // TODO call UserSlice to reset password.

            if (!error) {
                setMessage("Password reset. Redirecting to login.");
                setTimeout(() => navigate("/login"), 2000);
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        if (error) {
            if (username === "" || password === "" || checkPassword === "") {
                setMessage("Missing field");
            }
            else if (password !== checkPassword) {
                setMessage("Passwords don't match");
            }
            else {
                setMessage("There was a problem resetting your password. Please try again.");
            }
        }
    }, [error]);

    useEffect(() => {
        setMessage("");
        setError(false);
    }, [password, checkPassword]);

    return (
        <div>
            <div className="reset-password-container">
                <img className={"logo"} src={musicConnectLogo} alt={`MusicConnect Logo`}/>
                <div className={"reset-password-wrapper"}>
                    <div className={"username-container"}>
                        <p className={"username-label"}>Enter Username:</p>
                        <TextField hiddenLabel id="username-field" size="small" placeholder={"Username"} sx={{ width: '60%' }} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className={"password-container"}>
                        <p className={"password-label"}>Enter New Password:</p>
                        <div className={"password-label"}></div>
                        <TextField hiddenLabel id="password-field" size="small" type={"password"} placeholder={"Password"} sx={{ width: '60%' }} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className={"password-container"}>
                        <p className={"password-label"}>Re-Enter New Password:</p>
                        <div className={"password-label"}></div>
                        <TextField hiddenLabel id="password-field" size="small" type={"password"} placeholder={"Re-enter Password"} sx={{ width: '60%' }} onChange={(e) => setCheckPassword(e.target.value)} />
                    </div>
                </div>
                <div className={"auth-footer"}>
                    {message !== "" ? <Alert severity={error ? "error" : "success"}>{message}</Alert> : null}
                    <Button className={"reset-password-button"} variant="contained" loading={loading} loadingIndicator="Loading…" sx={{ backgroundColor: "#20B654", color: "white", width: "100px" }} onClick={resetPassword}>Reset Password</Button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;