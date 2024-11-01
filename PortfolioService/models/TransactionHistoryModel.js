const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "TransactionHistory",
    tableName: "transactionHistory",
    columns: {
        historyId: {
            primary: true,
            type: "int",
            generated: true,
        },
        userId: {
            type: "int",
            nullable: false,
        },
        coin: {
            type: "varchar",
            length: 10,
            nullable: false,
        },
        quantity: {
            type: "float",
            nullable: false,
        },
        date: {
            type: "bigint",
            nullable: false,
        },
        sendingWallet: {
            type: "varchar",
            length: 25,
            nullable: true,
        },
        receivingWallet: {
            type: "varchar",
            length: 25,
            nullable: true,
        },
    },

    relations: {
        walletAddress: {
            type: "many-to-one",
            target: "WalletAddress",
            joinColumn: { name: "userId" },
            onDelete: "CASCADE",
        },
    }
})