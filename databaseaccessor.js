var mysql = require ("mysql");

exports.query = {

    getBabyInfo: function(babyId, callback) {

        exports.access.selectSingle({
                sql:
                "SELECT     b.Name " +
                ",          b.BirthDate " +
                ",          b.ExpectedDate " +
                ",          r.RecipeId " +
                ",          r.Name AS RecipeName " +
                ",          r.CaloriesPerOunce AS RecipeCaloriesPerOunce " +
                ", (        SELECT DATE_FORMAT(MAX(Date), '%Y-%m-%d %H:%i') FROM Feeds WHERE BabyId = b.BabyId) AS LastFeedTime " +
                ", (        SELECT Milliliters FROM Feeds WHERE BabyId = b.BabyId ORDER BY Date DESC LIMIT 1 ) AS LastFeedVolume " +
                ", (        SELECT MAX(Milliliters) FROM Feeds WHERE BabyId = b.BabyId) AS MaxFeedVolume " +
                "FROM       Babies b " +
                "INNER JOIN Recipes r ON r.RecipeId = b.RecipeId " +
                "WHERE      BabyId = ? ",
                values: babyId
            },
            callback);

    },

    getFeedTotalsPerDay: function(callback) {

        exports.access.selectMultiple ({
                sql:
                "SELECT     DATE_FORMAT(f.Date, '%Y-%m-%d') AS Date " +
                ",          SUM(f.Milliliters) AS TotalVolume " +
                ", (        SELECT Ounces FROM Weights WHERE Date <= DATE_FORMAT(f.Date, '%Y-%m-%d') ORDER BY Date DESC LIMIT 1) AS WeightOuncesOnDay " +
                ", (        SELECT CaloriesPerKilogram FROM Goals WHERE Date <= DATE_FORMAT(f.Date, '%Y-%m-%d') ORDER BY Date DESC LIMIT 1) AS GoalCaloriesPerKilogramOnDay " +
                ",          DATE_FORMAT(MAX(f.Date), '%Y-%m-%d %H:%i') AS LastFeedTime " +
                ",          AVG(r.CaloriesPerOunce) AS AverageRecipeCaloriesPerOunce " +
                "FROM       Feeds f " +
                "INNER JOIN Recipes r ON r.RecipeId = f.RecipeId " +
                "GROUP BY   DATE_FORMAT(f.Date, '%Y-%m-%d')"
            },
            callback);

    },

    getRecipes: function(accountId, callback) {

        exports.access.selectMultiple({
                sql:
                "SELECT     r.* " +
                ", (        SELECT MAX(Date) FROM Feeds WHERE RecipeId = r.RecipeId) AS LastUsed " +
                "FROM       Recipes r " +
                "WHERE      r.AccountId = ? " +
                "ORDER BY   r.Name ASC ",
                values: accountId
            },
            callback);

    },

    getFeedsForDay: function(day, callback) {

        exports.access.selectMultiple ({
                sql:
                "SELECT    DATE_FORMAT(Date, '%H:%i') AS Time " +
                ",         Milliliters " +
                "FROM      Feeds " +
                "WHERE     DATE_FORMAT(Date, '%Y-%m-%d') = ? " +
                "ORDER BY  Date",
                values: day
            },
            callback);

    },

    insertFeed: function(babyId, dateTime, milliliters, recipeId, callback) {

        exports.access.insert({
            sql:
            "INSERT INTO Feeds " +
            "(           BabyId, RecipeId, Date, Milliliters) " +
            "VALUES (    ?, ?, ?, ?)",
            values: [babyId, recipeId, dateTime, milliliters]
            },
            callback);

    },

    updateBabyDefaultRecipe: function(babyId, recipeId, callback) {

        exports.access.update({
            sql:
            "UPDATE Babies " +
            "SET    RecipeId = ? " +
            "WHERE  BabyId = ? ",
            values: [recipeId, babyId]
            },
            callback);

    }

};

exports.access = {

    db: null,

    init: function () {

        // create the db connection
        this.db = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // connect to the database
        this.db.connect((error) => {
            if (error) {
                // TODO: write error data to logs
                console.log('Error connecting to Db: ' + error);
                return;
            }
        });

    },

    close: function () {

        // close the database connection
        this.db.end();

    },

    handleError: function (query, error) {

        // TODO: write error data to logs
        console.log("Error running query: " + error);
        console.log(query);

    },

    selectSingle: function (query, callback) {

        this.selectMultiple(query, callback, true);

    },

    selectMultiple: function (query, callback, returnSingle) {

        this.init();

        // run the query
        this.db.query(query, (error, rows) => {

            // report error and return if error state
            if (error) return exports.access.handleError(query, error);

            // call the callback with data
            if (returnSingle) callback(rows[0]);
            else callback(rows);

        });

        this.close();

    },

    insert: function (query, callback) {

        this.init();

        this.db.query(query, (error, results) => {

            if (error) return exports.access.handleError(query, error);

            // call the callback with the insert ID
            callback(results.insertId);

        });

    },

    update: function (query, callback) {

        this.init();

        this.db.query(query, (error, results) => {

            if (error) return exports.access.handleError(query, error);

            // call the callback with number of affected records
            callback(results.affectedRows);

        });

    }

};