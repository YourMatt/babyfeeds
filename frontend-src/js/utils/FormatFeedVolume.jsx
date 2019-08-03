/*
    FormatFeedVolume
 */

import React from "react";
import * as Constants from "./Constants.jsx";
import {ConvertCaloriesToVolume} from "./Converters.jsx";

// Formats the feed volume given number of calories and the unit. Returns an object containing:
// volume: number matching the volume for the converted unit
// unitLabel: pluralized label
// sliderIncrement: the amount to increment with each slider step
// sliderMax: the max value to allow for the slider
export default function FormatFeedVolume (units, calories, topCaloriesForDay, recipeCaloriesPerOunce) {

    let volume = ConvertCaloriesToVolume(calories, units, recipeCaloriesPerOunce),
        unitLabel = "",
        sliderIncrement = 0,
        sliderMax = 0;

    switch (units) {
        case "cals":
            unitLabel = "Cal";

            if (topCaloriesForDay) {
                sliderIncrement = 1;
                sliderMax = topCaloriesForDay + 20; // TODO: Calculate as percentage
            }

            break;
        case "mls":
            unitLabel = "Ml";

            if (topCaloriesForDay) {
                sliderIncrement = 5;
                sliderMax = ConvertCaloriesToVolume(topCaloriesForDay, units, recipeCaloriesPerOunce) + 20; // TODO: Calculate as percentage after mls conversion
            }

            break;
        case "ozs":
            unitLabel = "Oz";

            if (topCaloriesForDay) {
                sliderIncrement = 0.1;
                sliderMax = ConvertCaloriesToVolume(topCaloriesForDay, units, recipeCaloriesPerOunce) + 1; // TODO: Calculate as percentage after ounce conversion
            }

            break;
    }

    if (volume !== 1) unitLabel += "s";

    return {
        volume: volume,
        unitLabel: unitLabel,
        sliderIncrement: sliderIncrement,
        sliderMin: sliderIncrement,
        sliderMax: sliderMax
    }

}
