/*
    ApiLoadWeights
 */

import React from "react";

// Loads baby's weight data from the API.
export default function ApiLoadWeights (callback) {

    fetch("/api/load/weights")
    .then(results => {
        return results.json();
    })
    .then(data => {
        callback(data);
    });

}
