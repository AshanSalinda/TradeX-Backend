const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Watchlist",
    tableName: "watchlist",
    columns: {
        userId: {
            primary: true,
            type: "int",
        },
        coins: {
            type: "varchar",
            array: true,
        },
    },
})