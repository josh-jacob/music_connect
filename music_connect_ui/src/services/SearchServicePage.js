import "./SearchServicePage.css";
import SearchBar from "../components/SearchBar";
import Header from "../components/Header";

const SearchServicePage = ({type="MusicConnect"}) => {
    return (
        <div className="search-service-page">
            <Header />
            <div className="service-content">
                {/* add back button */}
                <SearchBar service={type}/>
            </div>
        </div>
    );
};

export default SearchServicePage;