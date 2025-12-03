import "./VerifyEmailPage.css";
import {useSearchParams} from "react-router";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {verifyAccount} from "../../slices/UserSlice.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";

const VerifyEmailPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();

    const token = searchParams.get("token");

    useEffect(() => {
        dispatch(verifyAccount(token));
    }, []);

    return (
        <div className="verify-email-page">
            <div className="email-verified">
                <FontAwesomeIcon icon={faCheck} color="#1ED760" size={"3x"}/>
                <p>Your email has been successfully verified.</p>
                <p>You can close this page and proceed to the MusicConnect login page.</p>
            </div>
        </div>
    );
}

export default VerifyEmailPage;