/*
    ApiSaveRecipe
 */

import React from "react";

// Saves a new or existing recipe against the API.
export default function ApiSaveRecipe (saveData, callback) {

    fetch("/api/saverecipe", {
        method: "POST",
        headers: {
            "Authorization": "Basic " + btoa("1:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            recipeId: (saveData.recipeId > 0) ? saveData.recipeId : 0,
            name: saveData.name,
            notes: saveData.notes,
            caloriesPerOunce: saveData.caloriesPerOunce,
            selectable: (saveData.selectable) ? 1 : 0
        })
    })
        .then(results => {
            return results.json();
        })
        .then(data => {
            callback(true);
        });

}
