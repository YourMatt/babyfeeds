/*
    CalendarMonth
    Builds a grid representing a month.
 */

import React, {Component} from "react";

// import components
import CalendarDay from "./CalendarDay.jsx";

// import utilities
import FormatCssClass from "../utils/FormatCssClass.jsx";

// export object
export default class CalendarMonth extends Component {

    // Renders the month.
    render() {

        let monthName = moment(this.props.month).format("MMMM");

        // build the day controls
        let weeks = [];
        let days = [];
        let firstDay = moment(this.props.month).format("d");
        for (let i = 1; i <= 35; i++) { // always show 5 rows of 7 days

            // find the percentage to goal for the given day
            let day = i - firstDay;
            let dayPercent = 0;
            if (day >= 1) {
                let checkDate = this.props.month + "-" + ((day < 10) ? "0" + day : day);
                let dayData = this.props.data.find((datum) => { return datum.Date === checkDate });
                if (dayData) {
                    dayPercent = dayData.Percent;
                }
            }

            // build the day controls
            days.push(
                <CalendarDay
                    key={monthName + "-day-" + i}
                    percent={dayPercent}
                    dayIndex={i}
                />
            );

            // move days into weekly row after 7 days
            if (i % 7 === 0) {
                weeks.push(
                    <div
                        key={monthName + "-week-" + i}
                        className={FormatCssClass("week")}
                    >
                        {days}
                    </div>
                );
                days = [];
            }

        }

        return (
            <div className={FormatCssClass("calendar")}>
                {monthName}
                {weeks}
            </div>
        );

    }

}
