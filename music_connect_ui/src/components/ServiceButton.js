import "./ServiceButton.css";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Card} from "@mui/material";

const ServiceButton = ({service, serviceURL, icon, colour}) => {
    return (
        <Card className="ServiceButton" component="section">
            <a className={service} href={serviceURL}>
                <FontAwesomeIcon icon={icon} size="5x" color={colour}/>
                <h3 style={{ color: "black" }}>{service}</h3>
            </a>
        </Card>
    );
};

export default ServiceButton;