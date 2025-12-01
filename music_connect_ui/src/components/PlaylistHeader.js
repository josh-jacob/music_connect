import "./PlaylistHeader.css";

const PlaylistHeader = ({name, playlistCover, numTracks}) => {
    return (
        <div className="playlist-header-container">
            <img src={playlistCover} alt={`${name} playlist cover`} />
            <div className="playlist-info">
                <h1 className={"playlist-name"}>{name}</h1>
                <h3 className={"tracks-count"}>{numTracks} Tracks</h3>
            </div>
        </div>
    );
}

export default PlaylistHeader;