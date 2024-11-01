const EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Asset",
    tableName: "asset",
    columns: {
        userId: {
            primary: true,
            type: "int",
            nullable: false,
        },
        symbol: {
            primary: true,
            type: "varchar",
            length: 10,
            nullable: false,
        },
        tradingBalance: {
            type: "float",
            default: 0,
            nullable: false,
        },
        holdingBalance: {
            type: "float",
            default: 0,
            nullable: false,
        },
        fundingBalance: {
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
        walletAddress: {
            type: "many-to-one",
            target: "WalletAddress",
            joinColumn: { name: "userId" },
            onDelete: "CASCADE",
        },
    }
})