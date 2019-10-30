/*
    ApiSaveWeight
 */

import React from "react";

// Saves a new weight against the API.
export default function ApiSaveWeight (saveData, callback) {

    fetch("/api/saveweight", {
        method: "POST",
        headers: {
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
