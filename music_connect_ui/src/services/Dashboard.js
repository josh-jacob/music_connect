import './Dashboard.css';
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ServiceButton from "../components/ServiceButton";
import { faYoutube, faSpotify } from '@fortawesome/free-brands-svg-icons';

const DashboardPage = () => {
    return (
        <div className="dashboard-page">
            <Header />
            <div className="dashboard-page-content">
                <SearchBar />
                <div className="service-cards">
                    <ServiceButton className={"YouTube Music Service"} service="YouTube Music" serviceURL="/youtube-music" icon={faYoutube} colour="red"/>
                    <ServiceButton className={"Spotify Service"} service="Spotify" serviceURL="/spotify" icon={faSpotify} colour="#1ED760"/>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;