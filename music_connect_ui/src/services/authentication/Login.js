import './Login.css';
import musicConnectLogo from '../../files/music-connect-logo.png';
import spotifyLogo from '../../files/spotify-logo.png';
import youTubeMusicLogo from '../../files/youtube-music-logo.png';
import Header from '../../components/Header';
import TextField from '@mui/material/TextField';
import {useEffect, useState} from "react";
import {Alert, Button} from "@mui/material";

const LoginPage = ({type="MusicConnect"}) => {

    const [showPassword, setShowPassword] = useState(false);
    const [logo, setLogo] = useState(musicConnectLogo);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [colour, setColour] = useState("#20B654");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (type === "Spotify") {
            setLogo(spotifyLogo);
            setColour("#1ED760");
        } else if (type === "YouTube Music") {
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
            {type !== "MusicConnect" ? <Header /> : <></>}
            <div className="auth-container">
                <img className={"logo"} src={logo} alt={`${type} Logo`}/>
                <div className={"auth-wrapper"}>
                    <div className={"username-container"}>
                        <p className={"username-label"}>Username:</p>
                        <TextField hiddenLabel id="username-field" size="small" placeholder={"Username"} sx={{ width: '80%' }} />
                    </div>
                    <div className={"password-container"}>
                        <p className={"password-label"}>Password:</p>
                        <div className={"password-label"}></div>
                        <TextField hiddenLabel id="password-field" size="small" type={"password"} placeholder={"Password"} sx={{ width: '80%' }} />
                    </div>
                </div>
                <div className={"auth-footer"}>
                    {type === "MusicConnect" ? <p className={"create-account"}>Don't have an account? <a href={'/create-account'}>Create Account</a></p> : <></>}
                    {error ? <Alert severity="error">There was a problem logging you in. Please try again.</Alert>: ""}
                    <Button className={"login-button"} variant="contained" loading={loading} loadingIndicator="Loading…" sx={{ backgroundColor: colour, color: "white", width: "100px" }} onClick={() => authenticate}>Login</Button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;