/*
    CalendarDay
    Builds a cell representing a day.
 */

import React, {Component} from "react";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";

// export object
export default class CalendarDay extends Component {

    // Renders the day.
    render() {

        let contents = "";
        let classes = ["day"];

        // set content and classes where data exist
        if (this.props.percent) {
            contents = this.props.percent;

            // create tiers correlating with the percentage eaten to show red-green for bad-good
            let tier = 10;
            let level = 1;
            for (let i = 70; i < 110; i += 5) {
                if (this.props.percent < i) {
                    tier = level;
                    break;
                }
                level++;
            }
            classes.push("tier" + tier);

        }

        // set format for empty cells
        else {
            contents = "\u00A0"; // set to non-breaking space to ensure empty weeks are displayed
            classes.push("empty");
            classes.push((this.props.dayIndex % 2) ? "even" : "odd");
        }

        // return jsx
        return (
            <div className={FormatCssClass(classes)}>
                {contents}
            </div>
        );

    }

}
