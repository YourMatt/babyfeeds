/*
    FormatAge
 */

import React from "react";

// Finds the age given today's date and a given date representing birthdate or expected date, then formats into a
// readable format of: Xmos Ywks Zdays. Values with 0 are omitted. Pluralization is accounted for.
export default function FormatAge (today, ageDate) {

    // convert params to moment objects
    today = moment(today);
    ageDate = moment(ageDate);

    // calculate the number of months, weeks, and days
    let ageMonthsFractional = today.diff(ageDate, "months", true);
    let ageMonths = Math.floor(ageMonthsFractional);
    let ageDaysInMonth = moment([0, 0, Math.ceil((ageMonthsFractional % 1) * 31 + 1)]).diff(moment([0, 0, 1]), 'days');
    let ageWeeksInMonth = Math.floor(ageDaysInMonth / 7);
    let ageDaysInWeek = ageDaysInMonth % 7;

    // construct the month/weeks/days elements
    let ageMonthsFormatted = "";
    let ageWeeksFormatted = "";
    let ageDaysFormatted = "";
    let plural = "";

    if (ageMonths) {
        plural = (ageMonths === 1) ? "" : "s";
        ageMonthsFormatted = <span>{ageMonths}<small>mo{plural}</small></span>;
    }
    if (ageWeeksInMonth) {
        plural = (ageWeeksInMonth === 1) ? "" : "s";
        ageWeeksFormatted = <span>{ageWeeksInMonth}<small>wk{plural}</small></span>;
    }
    if (ageMonths < 12 && ageDaysInWeek) { // show days only if under a year old
        plural = (ageDaysInWeek === 1) ? "" : "s";
        ageDaysFormatted = <span>{ageDaysInWeek}<small>dy{plural}</small></span>;
    }

    // return jsx
    return (
        <div>
            {ageMonthsFormatted} {ageWeeksFormatted} {ageDaysFormatted}
        </div>
    );

}
