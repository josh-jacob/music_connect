import "./SpotifyServicePage.css";
import SearchBar from "../components/SearchBar";
import Header from "../components/Header";

const SpotifyServicePage = () => {
    return (
        <div className="spotify-service-page">
            <Header />
            <div className="service-content">
                <SearchBar service="Spotify"/>
                {/* add profile pic and spotify icon*/}
            </div>
            <div className={"playlists"}>
                {/* add playlist content to pull from api*/}
            </div>

        </div>
    );
};

export default SpotifyServicePage;