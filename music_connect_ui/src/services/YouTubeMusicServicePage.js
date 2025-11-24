import "./YouTubeMusicServicePage.css";
import SearchBar from "../components/SearchBar";
import Header from "../components/Header";

const YouTubeMusicServicePage = () => {
    return (
        <div className="youtube-service-page">
            <Header />
            <div className="service-content">
                <SearchBar service="YouTube Music"/>
                {/* add profile pic and youtube icon*/}
            </div>
            <div className={"playlists"}>
                {/* add playlist content to pull from api*/}
            </div>

        </div>
    );
};

export default YouTubeMusicServicePage;