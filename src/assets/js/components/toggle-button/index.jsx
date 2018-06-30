import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faToggleOff, faToggleOn} from "@fortawesome/free-solid-svg-icons/index";
import {Button} from 'reactstrap';


export default function MyToggleButton(props) {
    return <Button color="primary" active={!!props.powerOn} onClick={props.onPowerToggle}>
        <FontAwesomeIcon icon={props.powerOn ? faToggleOn : faToggleOff}/>
    </Button>;
};