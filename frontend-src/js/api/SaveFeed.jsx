/*
    ApiSaveFeed
 */

import React from "react";

// Saves a new feed against the API.
export default function ApiSaveFeed (saveData, callback) {

    fetch("/api/savefeed", {
        method: "POST",
        headers: {
            "Authorization": "Basic " + btoa("1:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            feedId: saveData.feedId,
            dateTime: saveData.dateTime,
            calories: saveData.calories,
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
