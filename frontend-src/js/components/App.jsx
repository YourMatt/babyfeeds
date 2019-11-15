/*
    App
 */

import React, {Component} from "react";

// import components
import Age from "./Age.jsx";
import FeedRecorder from "./FeedRecorder.jsx";
import History from "./History.jsx";
import LastFeedTime from "./LastFeedTime.jsx";
import Loading from "./Loading.jsx";
import Menu from "./Menu.jsx";
import Modal from "./Modal.jsx";
import SiteTitle from "./SiteTitle.jsx";
import Weight from "./Weight.jsx"

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";
import StateManager from "../utils/StateManager.jsx";

// export object
export default class App extends Component {

    // Constructor.
    constructor(props, context) {
        super(props, context);

        // load all server data
        StateManager.ReloadFromServer();

    };

    // Renders the full application.
    render() {

        return (
            <div className={FormatCssClass("app")}>
                <div className={FormatCssClass("header")}>
                    <LastFeedTime/>
                    <Menu/>
                </div>
                <div className={FormatCssClass("body")}>
                    <FeedRecorder/>
                    <History/>
                </div>
                <div className={FormatCssClass("footer")}>
                    <Weight/>
                    <Age/>
                </div>
                <Modal/>
                <Loading/>
            </div>
        );

    }

}
