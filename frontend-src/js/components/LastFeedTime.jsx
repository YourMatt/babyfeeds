/*
    LastFeedTime
 */

import React, {Component} from "react";

import FormatCssClass from "../utils/FormatCssClass.jsx";

export default class LastFeedTime extends Component {

    render() {

        return (
            <div className={FormatCssClass("last-feed")}>
                Last Fed at {this.props.lastFeedTime}
            </div>
        );

    }

}
