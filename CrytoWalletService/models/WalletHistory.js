const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "WalletHistory",
    tableName: "walletHistory",
    columns: {
        historyId: {
            primary: true,
            type: "int",
            generated: true,
        },
        walletId: {
            type: "int",
            nullable: true,
        },
        coin: {
            type: "varchar",
            length: 10,
            nullable: true,
        },
        type: {
            type: "varchar",
            length: 10,
            nullable: true,
        },
        quantity: {
            type: "float",
            nullable: true,
        },
        date: {
            type: "timestamp with time zone",
            nullable: true,
        },
        from_to: {
            type: "varchar",
            length: 15,
            nullable: true,
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