const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Favourite",
    tableName: "favourite",
    columns: {
        newsId: {
            type: "int",
            nullable: false,
            primary: true

        },
        userId: {
            type: "int",
            nullable: false,
            primary: true

        },   
    },
    
    relations: {
        news: {
            type: "many-to-one",
            target: "News",
            joinColumn: { name: "newsId" },
            onDelete: "CASCADE"
        },
    },
})