
exports.display = function (res, pageName, data) {

    let pageData = loadCommonEjsVariables ();
    pageData.PAGE = pageName;

    res.locals = ""; // fixes object conversion error in production environment

    loadDependencies (pageData, function (pageData) {

        // evaluate the page to pull the corresponding template
        switch (pageName) {

            // render static pages
            case "index":
            case "index-react":

                res.render (pageName + ".ejs", pageData);

                break;

        }

    });

};

function loadCommonEjsVariables () {

    let ejsVariables = loadBasePageDataFromEnvironmentVariables ();
    ejsVariables.UTILS = loadEjsUtilities ();
    ejsVariables.PAGE = "";

    return ejsVariables;

}

function loadBasePageDataFromEnvironmentVariables () {

    return {};

}

function loadEjsUtilities () {

    return {
        moment: require ("moment"),
        numeral: require ("numeral")
    };

}

function loadDependencies (pageData, callback) {

    callback (pageData);

}
