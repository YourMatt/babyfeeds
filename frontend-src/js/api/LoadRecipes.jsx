/*
    ApiLoadRecipes
 */

import React from "react";

// Loads all recipe data from the API.
export default function ApiLoadRecipes (callback) {

    fetch("/api/load/recipes")
    .then(results => {
        return results.json();
    })
    .then(data => {
        console.log(data); // TODO: Remove this
        callback(data);
    });

}
