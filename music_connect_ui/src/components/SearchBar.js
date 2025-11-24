import "./SearchBar.css";
import {useState} from "react";
import TextField from "@mui/material/TextField";
import {IconButton, InputAdornment} from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({service="MusicConnect", onSearch}) => {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        // call search slice send query to be searched
    };

    return (
        <div className="SearchBar">
            <TextField className={"search-bar"} placeholder={`Search ${service}`} variant="outlined" sx={{ width: "800px", padding: "1px" }} onChange={() => {}/* update query */} slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={handleSearch()}>
                                <FontAwesomeIcon icon={faSearch} size={"sm"}/>
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}/>
        </div>
    );
};

export default SearchBar;