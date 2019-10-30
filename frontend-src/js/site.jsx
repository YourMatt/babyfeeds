
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.jsx";
import StateManager from "./utils/StateManager.jsx";

import { Provider } from 'react-redux'

//const store = createStore(storeModel);

ReactDOM.render(
    <App/>,
    document.querySelector("#container")
);
