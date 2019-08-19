/*
    Menu Feeds
    Displays menu options for managing feeds.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";

// export object
export default class MenuFeeds extends Component {

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
                <h1>Feeds</h1>
                <p>Feeds panel.</p>
            </div>
        );

    }

}
