const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "News",
    tableName: "news",
    columns: {
        newsId: {
            type: "int",
            primary: true,
            generated: true,
            nullable: false
        },
        url: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        image: {
            type: "varchar",
            length: 255,
            nullable: true
        },
        title: {
            type: "varchar",
            nullable: false
        },
        description: {
            type: "text",
            nullable: true
        },
        publishedAt: {
            type: "timestamp",
            nullable: false
        },
        latest: {
            type: "boolean",
            nullable: false,
            default: true
        },
       
        favourite:{
            type: "boolean",
            nullable: false,
            default: false
        },
    },
});
