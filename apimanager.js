var database = require ("./databaseaccessor.js"),
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

                        database.query.getFeedTotalsPerDay((feedTotalsPerDay) => {

                            let goalCaloriesForDay = 0;
                            let totalCaloriesForDay = 0;
                            feedTotalsPerDay.forEach(function (element) {
                                goalCaloriesForDay = Math.ceil(element.WeightOuncesOnDay * process.env.KILOGRAMS_PER_OUNCE * element.GoalCaloriesPerKilogramOnDay);
                                totalCaloriesForDay = Math.ceil(element.AverageRecipeCaloriesPerOunce / process.env.MILLILITERS_PER_OUNCE * element.TotalVolume);
                                element.Percent = Math.round(totalCaloriesForDay / goalCaloriesForDay * 100);
                            });

                            let today = moment().format("YYYY-MM-DD");
                            let actualAge = moment().diff(moment(babyData.BirthDate), "week");
                            let correctedAge = moment().diff(moment(babyData.ExpectedDate), "week");
                            let weightInOunces = feedTotalsPerDay[feedTotalsPerDay.length - 1].WeightOuncesOnDay;
                            let weight = Math.floor(weightInOunces / 16) + "lbs " + (weightInOunces % 16) + "oz";
                            let goalVolume = Math.round(goalCaloriesForDay / (babyData.RecipeCaloriesPerOunce / process.env.MILLILITERS_PER_OUNCE));

                            database.query.getFeedsForDay(today, (feedsForDay) => {

                                res.json({

                                    // new values after react rewrite
                                    dateToday: today,
                                    dateBirth: moment(babyData.BirthDate).format("YYYY-MM-DD"),
                                    dateExpected: (babyData.ExpectedDate) ? (moment(babyData.ExpectedDate).format("YYYY-MM-DD")) : "",
                                    lastFeedTime: moment(babyData.LastFeedTime).format("h:mma"),
                                    lastFeedVolume: babyData.LastFeedVolume,
                                    maxFeedVolume: babyData.MaxFeedVolume,
                                    recipeId: babyData.RecipeId,
                                    recipeName: babyData.RecipeName,
                                    weightOunces: weightInOunces,

                                    // original values
                                    today: today,
                                    feedTotalsPerDay: feedTotalsPerDay,
                                    feedsForToday: feedsForDay,
                                    feedRequiredForToday: goalVolume,
                                    weight: weight,
                                    actualAge: actualAge,
                                    correctedAge: correctedAge

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
                let milliliters = req.body.milliliters;
                let recipeId = req.body.recipeId;

                database.query.insertFeed(process.env.SELECTED_BABY, dateTime, milliliters, recipeId, () => {
                    database.query.updateBabyDefaultRecipe(process.env.SELECTED_BABY, recipeId, () => {
                        res.json({});
                    });
                });

                processed = true;
            }
            break;

    }

    // exit as not found if nothing processed the request already
    if (!processed)
        res.status(404).end();

};
