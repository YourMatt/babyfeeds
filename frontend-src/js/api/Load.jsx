/*
    ApiLoad
 */

import React from "react";

// Loads all initial data from the API.
export default function ApiLoad (callback) {

    fetch("/api/load")
    .then(results => {
        return results.json();
    })
    .then(data => {
        console.log(data); // TODO: Remove this
        callback(data);
    });

}
