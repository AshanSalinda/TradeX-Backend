const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "EduResources",
    tableName: "eduResources",
    columns: {
        eduId: {
            primary: true,
            type: "int",
            generated: true,
        },
        title: {
            type: "varchar",
            nullable: false,
        },
        description: {
            type: "varchar",
            nullable: false,
        },
        image: {
            type: "varchar",
            nullable: false,
        },
        url: {
            type: "varchar",
            nullable: false,
        },
        

    },
})