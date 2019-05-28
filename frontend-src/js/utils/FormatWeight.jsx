/*
    FormatWeight
 */

import React from "react";

// Converts provided number of ounces into readable weight. If passing in true, then will convert ounces to kilograms.
export default function FormatWeight (ounces, returnKilograms) {

    // convert ounces to kilograms if requested
    if (returnKilograms) {

        let kilograms = ounces * 0.0283495;

        return (
            <div>
                {kilograms.toFixed(1)}<small>kgs</small>
            </div>
        )

    }

    // format for lbs/oz if not returning in kilos
    else {

        let pounds = Math.floor(ounces / 16);
        ounces %= 16;
        let pluralPounds = (pounds === 1) ? "" : "s";

        return (
            <div>
                {pounds}<small>lb{pluralPounds}</small> {ounces}<small>oz</small>
            </div>
        );

    }

}
