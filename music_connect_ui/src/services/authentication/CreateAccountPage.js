import './CreateAccountPage.css';
import musicConnectLogo from '../../files/music-connect-logo.png';
import TextField from '@mui/material/TextField';
import {useEffect, useState} from "react";
import {Alert, Button} from "@mui/material";
import {useNavigate} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import validator from "validator";
import {createUserAccount, verifyAccount} from "../../slices/UserSlice.ts";

const CreateAccountPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const authToken = useSelector((state) => state.users.user.token);

    const createAccount = async () => {
        setLoading(true);

        if (username.length < 1 || password.length < 8) {
            setError(true);
        }
        else if (!validator.isEmail(email)) {
            setError(true);
        }
        else { // TODO: I am not getting a verification email - Need to figure out why
            await dispatch(createUserAccount({username: username, email: email, password: password, fullName: name}));
            if (!error) {
                await dispatch(verifyAccount(authToken));
                setMessage("Account created. Please check your email to verify your account. Redirecting to login.");
                setTimeout(() => navigate("/login"), 2000);
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        if (error) {
            if (username === "" || password === "" || email === "" || name === "") {
                setMessage("Missing field");
            }
            else if (username.length < 1 || password.length < 8) {
                setMessage("Invalid username or password.");
            }
            else if (!validator.isEmail(email)) {
                setMessage("Invalid email format.");
            }
            else {
                setMessage("There was a problem creating your account. Please try again.");
            }
        }
    }, [error]);

    useEffect(() => {
        setError(false);
        setMessage("");
    }, [username, password, email, name]);

    return (
        <div>
            <div className="auth-container">
                <img className={"logo"} src={musicConnectLogo} alt={`MusicConnect Logo`}/>
                <div className={"auth-wrapper"}>
                    <div className={"email-container"}>
                        <p className={"email-label"}>Email:</p>
                        <TextField hiddenLabel id="eamil-field" size="small" placeholder={"Email"} sx={{ width: '80%' }} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className={"name-container"}>
                        <p className={"name-label"}>Name:</p>
                        <TextField hiddenLabel id="username-field" size="small" placeholder={"Full Name"} sx={{ width: '80%' }} onChange={(e) => setName(e.target.value)} />
                    </div>
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