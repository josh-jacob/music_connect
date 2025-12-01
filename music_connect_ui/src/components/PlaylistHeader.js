import "./PlaylistHeader.css";

const PlaylistHeader = ({name, playlistCover, numTracks}) => {
    return (
        <div className="playlist-header-container">
            <div className="playlist-header">
                <img src={playlistCover} alt={`${name} playlist cover`} />
                <div className="playlist-info">
                    <h1 className={"playlist-name"}>{name}</h1>
                    <h1 className={"tracks-count"}>{numTracks} Tracks</h1>
                </div>
            </div>
        </div>
    );
}

export default PlaylistHeader;