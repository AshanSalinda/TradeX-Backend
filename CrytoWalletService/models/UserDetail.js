const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "UserDetail",
    tableName: "userdetail",
    columns: {
        walletId: {
            primary: true,
            type: "int",
            generated: true,
        },
        userId: {
            type: "int",
            nullable: false,
        },
        userName: {
            type: "varchar",
            length: 25,
            nullable: false,
        },
        password: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        seedPhrase: {
            type: "varchar",
            nullable: false,
        },
        walletAddress: {
            type: "varchar",
            nullable: true,
        },
    },
})