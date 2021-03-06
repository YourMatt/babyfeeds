/*
    ApiLoadFeeds
 */

import React from "react";

// Loads all feed data from the API.
export default function ApiLoadFeeds (callback) {

    fetch(
        "/api/load/feeds",
        {
            method: "get",
            headers: new Headers({
                Authorization: "Basic " + btoa("1:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08")
            })
        })
    .then(results => {
        return results.json();
    })
    .then(data => {
        callback(data);
    });

}
