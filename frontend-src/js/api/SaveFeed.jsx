/*
    ApiSaveFeed
 */

import React from "react";

// Saves a new feed against the API.
export default function ApiSaveFeed (saveData, callback) {

    fetch("/api/savefeed", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            dateTime: saveData.dateTime,
            milliliters: saveData.milliliters,
            recipeId: saveData.recipeId
        })
    })
    .then(results => {
        return results.json();
    })
    .then(data => {
        callback(true);
    });

}
