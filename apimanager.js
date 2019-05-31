const database = require ("./databaseaccessor.js"),
    moment = require("moment");

exports.process = function (req, res) {

    const endpoint = req.url;
    const method = req.method;
    let processed = false;

    switch (endpoint) {

        case "/api/load":
            if (method === "GET") {
                database.query.getBabyInfo(
                    process.env.SELECTED_BABY,
                    (babyData) => {

                        database.query.getFeedTotalsPerDay(process.env.SELECTED_BABY, (feedTotalsPerDay) => {

                            let today = moment().format("YYYY-MM-DD");
                            database.query.getFeedsForDay(today, (feedsForDay) => {

                                res.json({
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
                                    weightKilograms: babyData.WeightKilograms
                                });

                            });
                        });
                    }
                );

                processed = true;
            }
            break;

        case "/api/load/recipes":
            if (method === "GET") {
                database.query.getRecipes(
                    process.env.SELECTED_ACCOUNT,
                    function (recipeData) {

                        let recipes = [];
                        recipeData.forEach(function(data) {
                            recipes.push({
                                recipeId: data.RecipeId,
                                name: data.Name,
                                notes: data.Notes,
                                caloriesPerOunce: data.CaloriesPerOunce,
                                lastUsed: data.LastUsed
                            });
                        });

                        res.json(recipes);

                    }
                );

                processed = true;
            }
            break;

        case "/api/savefeed":
            if (method === "POST") {

                let dateTime = req.body.dateTime;
                let calories = req.body.calories;
                let recipeId = req.body.recipeId;

                database.query.getRecipe(
                    recipeId,
                    (recipe) => {

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
                );

                processed = true;
            }
            break;

    }

    // exit as not found if nothing processed the request already
    if (!processed)
        res.status(404).end();

};
