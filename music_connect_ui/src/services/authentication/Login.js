import './Login.css';
import musicConnectLogo from '../../files/music-connect-logo.png';
import spotifyLogo from '../../files/spotify-logo.png';
import youTubeMusicLogo from '../../files/youtube-music-logo.png';
import Header from '../../components/Header';
import TextField from '@mui/material/TextField';
import {useEffect, useState} from "react";
import {Alert, Button} from "@mui/material";
import {useNavigate} from "react-router";

const LoginPage = ({ type }) => {
    const navigate = useNavigate();

    const [logo, setLogo] = useState(musicConnectLogo);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [colour, setColour] = useState("#20B654");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (type === "spotify") {
            setLogo(spotifyLogo);
            setColour("#1ED760");
        } else if (type === "youtube-music") {
            setLogo(youTubeMusicLogo);
            setColour("#FF0000");
        } else {
            setLogo(musicConnectLogo);
            setColour("#20B654");
        }
    }, [type]);

    const authenticate = () => {
        setLoading(true);
        setError(false);

        // call Slice to authenticate.

        setLoading(false);
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
                    {error ? <Alert severity="error">There was a problem logging you in. Please try again.</Alert>: ""}
                    {type !== "music-connect" ? <Button className={"stay-unauthenticated"} variant="contained" sx={{ backgroundColor: "black", color: "white", width: "100px" }} onClick={() => {type === "spotify" ? navigate("/spotify") : navigate("/youtube-music")}} >Stay Unauthenticated</Button> : null}
                    <Button className={"login-button"} variant="contained" loading={loading} loadingIndicator="Loading…" sx={{ backgroundColor: colour, color: "white", width: "100px" }} onClick={() => authenticate}>Login</Button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;