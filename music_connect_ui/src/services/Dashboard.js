import './Dashboard.css';
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ServiceButton from "../components/ServiceButton";
import {faSpotify, faYoutube} from '@fortawesome/free-brands-svg-icons';
import {faArrowRightArrowLeft, faDownload} from '@fortawesome/free-solid-svg-icons';

const DashboardPage = () => {
    return (
        <div className="dashboard-page">
            <Header />
            <div className="dashboard-page-content">
                <SearchBar />
                <div className="service-cards">
                    <ServiceButton className={"service"} service="YouTube Music" serviceURL="/youtube-music" icon={faYoutube} colour="red"/>
                    <ServiceButton className={"service"} service="Spotify" serviceURL="/spotify" icon={faSpotify} colour="#1ED760"/>
                    <ServiceButton className={"service"} service="Migrate Playlists" serviceURL="/playlist-migration" icon={faArrowRightArrowLeft} colour="orange"/>
                    <ServiceButton className={"service"} service="Export Data" serviceURL="/export" icon={faDownload} colour="blue"/>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;