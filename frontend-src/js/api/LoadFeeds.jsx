/*
    ApiLoadFeeds
 */

import React from "react";

// Loads all feed data from the API.
export default function ApiLoadFeeds (callback) {

    fetch("/api/load/feeds")
    .then(results => {
        return results.json();
    })
    .then(data => {
        callback(data);
    });

}
