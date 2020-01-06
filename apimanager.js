const database = require ("./databaseaccessor.js"),
    moment = require("moment");

exports.process = function (req, res) {

    apiAuthenticate(req, res, accountId => {

        const endpoint = req.url.split("?")[0];
        const method = req.method;
        let processed = false;

        switch (endpoint) {

            case "/api/load":
                if (method === "GET") {
                    apiLoadAllData(res, accountId);
                    processed = true;
                }
                break;

            case "/api/load/feeds":
                if (method === "GET") {
                    database.query.getFeeds(process.env.SELECTED_BABY, req.query.date, (feeds) => {
                        res.json(feeds);
                    });

                    processed = true;
                }
                break;

            case "/api/load/recipes":
                if (method === "GET") {
                    database.query.getRecipes(
                        process.env.SELECTED_ACCOUNT,
                        function (recipeData) {

                            res.json(recipeData);

                        }
                    );

                    processed = true;
                }
                break;

            case "/api/saverecipe":
                if (method === "POST") {

                    let recipeId = req.body.recipeId;
                    let name = req.body.name;
                    let notes = req.body.notes;
                    let caloriesPerOunce = req.body.caloriesPerOunce;
                    let selectable = req.body.selectable;

                    // run an update if a recipe ID was supplied
                    if (recipeId) {
                        database.query.updateRecipe(
                            recipeId,
                            name,
                            notes,
                            caloriesPerOunce,
                            selectable,
                            () => {
                                res.json({});
                            }
                        );
                    }

                    // insert a new recipe if no recipe ID was supplied
                    else {
                        database.query.insertRecipe(
                            process.env.SELECTED_ACCOUNT,
                            name,
                            notes,
                            caloriesPerOunce,
                            selectable,
                            () => {
                                res.json({});
                            }
                        )
                    }

                    processed = true;
                }
                break;

            case "/api/savefeed":
                if (method === "POST") {

                    let feedId = req.body.feedId;
                    let dateTime = req.body.dateTime;
                    let calories = req.body.calories;
                    let recipeId = req.body.recipeId;

                    database.query.getRecipe(
                        recipeId,
                        (recipe) => {

                            // run an update if a feed ID was supplied
                            if (feedId) {
                                database.query.updateFeed(
                                    feedId,
                                    dateTime,
                                    calories,
                                    recipeId,
                                    () => {
                                        res.json({});
                                    }
                                )
                            }

                            // insert a new feed if no feed ID was supplied
                            else {
                                database.query.insertFeed(
                                    process.env.SELECTED_BABY,
                                    dateTime,
                                    calories,
                                    recipeId,
                                    () => {
                                        database.query.updateBabyDefaultRecipe(process.env.SELECTED_BABY, recipeId, () => {
                                            res.json({});
                                        });
                                    });
                            }

                        }
                    );

                    processed = true;
                }
                break;

            case "/api/load/weights":
                if (method === "GET") {
                    database.query.getWeights(process.env.SELECTED_BABY, (weights) => {
                        res.json(weights);
                    });

                    processed = true;
                }
                break;

            case "/api/saveweight":
                if (method === "POST") {

                    let weight = req.body.weight;
                    let today = moment().format("YYYY-MM-DD");

                    // load the last saved weight to check if an insert or update is needed
                    database.query.getLastWeight(
                        process.env.SELECTED_BABY,
                        lastWeight => {

                            // called after an insert or update, this will refresh today's feed volumes to ensure that the new weight is factored into the calorie goal
                            const callback = success => {
                                database.query.refreshDailyTotalsForDay(
                                    process.env.SELECTED_BABY,
                                    today,
                                    refreshSuccess => {
                                        res.json({});
                                    }
                                )
                            };

                            // update the existing weight if was last updated today
                            if (lastWeight.Date === today) {
                                database.query.updateWeight(
                                    lastWeight.WeightId,
                                    today,
                                    weight,
                                    callback
                                )
                            }

                            // insert the new weight if last updated in the past
                            else {
                                database.query.insertWeight(
                                    process.env.SELECTED_BABY,
                                    today,
                                    weight,
                                    callback
                                )
                            }

                        }
                    );

                    processed = true;
                }
                break;

        }

        // exit as not found if nothing processed the request already
        if (!processed)
            res.status(404).end();

    });

};

apiAuthenticate = function(req, res, callback) {

    const returnUnauthorized = () => {
        res.status(401).end("{}");
    };

    if (!req.headers.authorization) return returnUnauthorized();

    let authParts = req.headers.authorization.split(" ");
    if (authParts.length !== 2 || authParts[0] !== "Basic") return returnUnauthorized();

    let authString = Buffer.from(authParts[1], "base64").toString("ascii");
    authParts = authString.split(":");
    if (authParts.length !== 2 || !parseInt(authParts[0])) return returnUnauthorized();

    let accountId = parseInt(authParts[0]);
    let hashedPassword = authParts[1];
    database.query.authenticateAccountByAPICredentials(
        accountId,
        hashedPassword,
        success => {
            if (!success) return returnUnauthorized();

            callback(accountId);

        }
    );

};

apiLoadAllData = function(res, accountId) {

    // load account information
    database.query.getAccountInfo(accountId, accountData => {

        database.query.getAccountBabies(accountId, accountBabies => {

            database.query.getRecipes(accountId, recipes => {

                // find the last fed baby to set the default selected baby
                let lastFedBaby = 0;
                let lastFedBabyTime = 0;
                let returnBabies = {};
                for (let i = 0; i < accountBabies.length; i++) {
                    let baby = accountBabies[i];
                    if (baby.LastFeedTime > lastFedBabyTime) lastFedBaby = baby.BabyId;
                    database.query.getWeights(baby.BabyId, weights => {

                        database.query.getGoals(baby.BabyId, goals => {

                            database.query.getFeedsForDay(baby.BabyId, moment().format("YYYY-MM-DD"), (feedsForToday) => {

                                database.query.getFeedTotalsPerDay(baby.BabyId, (feedTotalsPerDay) => {

                                    returnBabies["Baby" + baby.BabyId] = {
                                        BabyId: baby.BabyId,
                                        Name: baby.Name,
                                        BirthDate: baby.BirthDate,
                                        ExpectedDate: baby.ExpectedDate,
                                        RecipeId: baby.RecipeId,
                                        LastFeedTime: baby.LastFeedTime,
                                        LastFeedCalories: baby.LastFeedCalories,
                                        MaxFeedCalories: baby.MaxFeedCalories,
                                        DailyTotals: feedTotalsPerDay,
                                        FeedsForToday: feedsForToday,
                                        Goals: goals,
                                        Weights: weights
                                    };

                                    // return after loading last baby data
                                    if (Object.keys(returnBabies).length === accountBabies.length) {
                                        res.json({
                                            DateToday: moment().format("YYYY-MM-DD"),
                                            SelectedBaby: lastFedBaby,
                                            Account: {
                                                AccountId: accountData.AccountId,
                                                Name: accountData.Name,
                                                Email: accountData.Email,
                                                CreateDate: accountData.CreateDate,
                                                Settings: {
                                                    DisplayAgeAsAdjusted: accountData.DisplayAgeAsAdjusted,
                                                    DisplayVolumeAsMetric: accountData.DisplayVolumeAsMetric,
                                                    DisplayWeightAsMetric: accountData.DisplayWeightAsMetric
                                                },
                                                Recipes: recipes
                                            },
                                            Babies: returnBabies
                                        });
                                    }
                                });
                            });
                        });
                    });
                }
            });
        });
    });

};