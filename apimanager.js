const database = require ("./databaseaccessor.js"),
    moment = require("moment");

exports.process = function (req, res) {

    const endpoint = req.url.split("?")[0];
    const method = req.method;
    let processed = false;

    switch (endpoint) {

        case "/api/load":
            if (method === "GET") {
                database.query.getBabyInfo(
                    process.env.SELECTED_BABY, // TODO: Get baby ID from input param
                    (babyData) => {
                        database.query.getWeights(
                            process.env.SELECTED_BABY, // TODO: Get baby ID from input param
                            (weightData) => {
                                database.query.getRecipes(
                                    process.env.SELECTED_ACCOUNT, // TODO: Get account from auth,
                                    (recipeData) => {
                                        database.query.getFeedTotalsPerDay(
                                            process.env.SELECTED_BABY,
                                            (feedTotalsPerDay) => {

                                                let today = moment().format("YYYY-MM-DD");
                                                database.query.getFeedsForDay(process.env.SELECTED_BABY, today, (feedsForDay) => {

                                                    res.json({
                                                        babyId: parseInt(process.env.SELECTED_BABY), // TODO
                                                        caloriesFeedMax: babyData.MaxFeedCalories,
                                                        caloriesLastFeed: babyData.LastFeedCalories,
                                                        caloriesGoal: feedTotalsPerDay[feedTotalsPerDay.length - 1].GoalCalories,
                                                        dateToday: today,
                                                        dateBirth: moment(babyData.BirthDate).format("YYYY-MM-DD"),
                                                        dateExpected: (babyData.ExpectedDate) ? (moment(babyData.ExpectedDate).format("YYYY-MM-DD")) : "",
                                                        feedsForToday: feedsForDay,
                                                        feedTotalsPerDay: feedTotalsPerDay,
                                                        lastFeedTime: moment(babyData.LastFeedTime).format("h:mma"),
                                                        recipeId: babyData.RecipeId,
                                                        recipeName: babyData.RecipeName,
                                                        recipeCaloriesPerOunce: babyData.RecipeCaloriesPerOunce,
                                                        weightKilograms: babyData.WeightKilograms, // TODO: Remove
                                                        weights: weightData,
                                                        recipes: recipeData
                                                    });

                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );

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

};
