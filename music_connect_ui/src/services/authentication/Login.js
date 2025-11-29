import './Login.css';
import TextField from '@mui/material/TextField';
import {useEffect, useState} from "react";
import {Alert, Button} from "@mui/material";
import {useNavigate} from "react-router";
import musicConnectLogo from '../../files/music-connect-logo.png';
import youTubeMusicLogo from '../../files/youtube-music-logo.png';
import Header from '../../components/Header';

const LoginPage = ({ type }) => {
    const navigate = useNavigate();

    const [logo, setLogo] = useState(musicConnectLogo);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [colour, setColour] = useState("#20B654");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    let isAuthenticated;

    useEffect(() => {
        if (type === "youtube-music") {
            setLogo(youTubeMusicLogo);
            setColour("#FF0000");
            isAuthenticated = false; // TODO
        } else {
            setLogo(musicConnectLogo);
            setColour("#20B654");
            isAuthenticated = false; // TODO
        }
    }, [type]);

    const authenticate = async () => {
        setLoading(true);
        setError(false);

        if (username.length === 0 || (type === "music-connect" && password.length === 0)) {
            setError(true);
            setErrorMessage("Username and password fields are required.");
        }
        else {
            // call Slice to authenticate and get user data.
            if (type === "youtube-music") {
                // TODO
            }
            else {
                // TODO
            }
        }

        setLoading(false);
        console.log(isAuthenticated);
        if (isAuthenticated) {
            navigate("/");
        }
        else {
            setError(true);
            setErrorMessage("There was a problem logging you in. Please check your credentials and try again.");
        }
    }

    return (
        <div>
            {type !== "music-connect" ? <Header /> : <></>}
            <div className="auth-container">
                <img className={"logo"} src={logo} alt={`${type} Logo`}/>
                <div className={"auth-wrapper"}>
                    <div className={"username-container"}>
                        <p className={"username-label"}>Username:</p>
                        <TextField hiddenLabel id="username-field" size="small" placeholder={"Username"} sx={{ width: '80%' }} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className={"password-container"}>
                        <p className={"password-label"}>Password:</p>
                        <div className={"password-label"}></div>
                        <TextField hiddenLabel id="password-field" size="small" type={"password"} placeholder={"Password"} sx={{ width: '80%' }} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </div>
                <div className={"auth-footer"}>
                    {type === "music-connect" ? <p className={"create-account"}>Don't have an account? <a href={'/create-account'}>Create Account</a></p> : <></>}
                    {error ? <Alert severity="error">{errorMessage}</Alert>: ""}
                    {type !== "music-connect" ? <Button className={"stay-unauthenticated"} variant="contained" sx={{ backgroundColor: "black", color: "white", width: "100px" }} onClick={() => {navigate("/youtube-music")}} >Stay Unauthenticated</Button> : null}
                    <Button className={"login-button"} variant="contained" loading={loading} loadingIndicator="Loading…" sx={{ backgroundColor: colour, color: "white", width: "100px" }} onClick={authenticate}>Login</Button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;