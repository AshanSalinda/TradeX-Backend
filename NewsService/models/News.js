const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "News",
    tableName: "news",
    columns: {
        newsId: {
            type: "int",
            generated: true,
            nullable: false
        },
        url: {
            primary: true,
            type: "varchar",
            length: 255,
            nullable: false
        },
        image: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        title: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        description: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        like: {
            type: "int",
            array: true,
            nullable: true

        },
        dislike: {
            type: "int",
            array: true,
            nullable: true

        },
        favourite:{
            type: "int",
            array: true,
            nullable: true

        },
        
        
    },
})