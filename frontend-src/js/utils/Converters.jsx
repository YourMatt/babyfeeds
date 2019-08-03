/*
    Converters
 */

import * as Constants from "./Constants.jsx";

export function ConvertCaloriesToVolume (calories, volumeUnit, recipeCaloriesPerOunce) {

    let volume = 0;

    switch (volumeUnit) {
        case "mls":

            volume = Math.round(calories * Constants.MillilitersPerOunce / recipeCaloriesPerOunce);

            break;
        case "ozs":

            volume = (calories / recipeCaloriesPerOunce).toFixed(1);

            break;
        case "cals":

            volume = calories;

            break;
    }

    return volume;

}

export function ConvertVolumeToCalories (volume, volumeUnit, recipeCaloriesPerOunce) {

    let calories = 0;

    switch (volumeUnit) {
        case "mls":

            calories = Math.round(volume / Constants.MillilitersPerOunce * recipeCaloriesPerOunce);

            break;
        case "ozs":

            calories = Math.round(volume * recipeCaloriesPerOunce).toFixed(1);

            break;
        case "cals":

            calories = volume;

            break;
    }

    return calories;

}