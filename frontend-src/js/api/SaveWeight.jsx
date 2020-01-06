/*
    ApiSaveWeight
 */

import React from "react";

// Saves a new weight against the API.
export default function ApiSaveWeight (saveData, callback) {

    fetch("/api/saveweight", {
        method: "POST",
        headers: {
            "Authorization": "Basic " + btoa("1:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"),
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            weight: saveData.weight
        })
    })
    .then(results => {
        return results.json();
    })
    .then(data => {
        callback(true);
    });

}
