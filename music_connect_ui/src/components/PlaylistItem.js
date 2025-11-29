import "./PlaylistItem.css";

const PlaylistItem = ({playlistName, playlistImage}) => {
    return (
        <div className="PlaylistItem">
            <img className={playlistName} alt={`${playlistName} album cover`} src={playlistImage} />
            <p>{playlistName}</p>
        </div>
    );
}

export default PlaylistItem;