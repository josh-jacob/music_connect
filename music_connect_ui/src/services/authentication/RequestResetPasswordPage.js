import "./RequestResetPasswordPage.css";
import musicConnectLogo from "../../files/music-connect-logo.png";
import TextField from "@mui/material/TextField";
import {Alert, Button} from "@mui/material";
import {useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {sendResetPasswordEmail} from "../../slices/UserSlice.ts";

const RequestResetPasswordPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const forgotPassword = async () => {
        setLoading(true);
        if (email === "") {
            setError(true);
        }
        else {
            await dispatch(sendResetPasswordEmail(email));
            setMessage("Reset Password email sent. Redirecting to login.");
            setTimeout(() => navigate("/login"), 2000);
        }

        setLoading(false);
    }

    useEffect(() => {
        if (error) {
            if (email === "") {
                setMessage("Missing field");
            }
            else {
                setMessage("There was a problem resetting your password. Please try again.");
            }
        }
    }, [error]);

    useEffect(() => {
        setMessage("");
        setError(false);
    }, [email]);

    return (
        <div>
            <div className="reset-password-container">
                <img className={"logo"} src={musicConnectLogo} alt={`MusicConnect Logo`}/>
                <div className={"reset-password-wrapper"}>
                    <div className={"email-container"}>
                        <p className={"email-label"}>Enter Email:</p>
                        <TextField hiddenLabel id="email-field" size="small" placeholder={"Email"} sx={{ width: '60%' }} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
                <div className={"auth-footer"}>
                    {message !== "" ? <Alert severity={error ? "error" : "success"}>{message}</Alert> : null}
                    <div className={"action-buttons"}>
                        <Button className={"back-button"} variant="contained" sx={{ backgroundColor: "#20B654", color: "white", width: "150px" }} onClick={() => navigate('/login')}>Back to Login</Button>
                        <Button className={"reset-password-button"} variant="contained" loading={loading} loadingIndicator="Loading…" sx={{ backgroundColor: "#20B654", color: "white", width: "100px" }} onClick={forgotPassword}>Send Password Reset</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestResetPasswordPage;