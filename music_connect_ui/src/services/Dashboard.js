import './Dashboard.css';
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";

const DashboardPage = () => {
    return (
        <div className="dashboard-page">
            <Header />
            <div className="dashboard-page-content">
                <SearchBar />
                {/* service button component*/}
            </div>
        </div>
    );
};

export default DashboardPage;