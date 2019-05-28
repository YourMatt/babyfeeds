
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.jsx";

ReactDOM.render(<App/>, document.querySelector("#container"));

/*
    RELOAD CODE FROM ORIGINAL JS

    // reload the page if hidden and showing again
    $(document).on("mozvisibilitychange visibilitychange", function(){
        var state = document.visibilityState || document.webkitVisibilityState;
        if (state === "visible") {
            babyFeeds.init();
        }
    });

*/
