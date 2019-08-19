/*
    Menu About
    Displays menu panel for displaying about info.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";

// export object
export default class MenuAbout extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        // intialize the state
        this.state = {};

    };

    // Renders the menu panel.
    render() {

        return (
            <div className={FormatCssClass("menu-panel-sub open")}>
                <h1>About</h1>
                <p>About panel.</p>
            </div>
        );

    }

}
