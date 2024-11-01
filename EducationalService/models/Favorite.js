const { JoinColumn } = require("typeorm")

const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Favorite",
    tableName: "favorite",
    columns: {
        eduId: {
            primary: true,
            type: "int",
            nullable: false,
        },
        userId: {
            primary: true,
            type: "int",
            nullable: false,
        } 
    },

    relations: {
        eduResources: {
            type: "many-to-one",
            target: "EduResources",
            joinColumn: {name: "eduId"},
            onDelete: "CASCADE"
        }
    }
})