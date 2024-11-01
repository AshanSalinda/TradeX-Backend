const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Capital",
    tableName: "capital",
    columns: {
        walletId: {
            primary: true,
            type: "int",
            nullable: false,
        },
        coin: {
            primary: true,
            type: "varchar",
            length: 10,
            nullable: false,
        },
        balance: {
            type: "float",
            default: 0,
            nullable: false,
        },
        AvgPurchasePrice: {
            type: "float",
            nullable: false,
        },
    },

    relations: {
        userDetail: {
            target: "UserDetail",
            type: "many-to-one",
            joinColumn: { name: "walletId" },
            onDelete: "CASCADE",
        },
    }
})