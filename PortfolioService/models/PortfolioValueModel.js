const EntitySchema = require("typeorm").EntitySchema

const columns = {
    userId: {
        primary: true,
        type: "int",
        nullable: false,
    },
    time: {
        primary: true,
        type: "float",
        nullable: false,
    },
    value: {
        type: "float",
        nullable: false,
    },
};

const relations = {
    walletAddress: {
        type: "many-to-one",
        target: "WalletAddress",
        joinColumn: { name: "userId" },
        onDelete: "CASCADE",
    },
};


const PortfolioHourlyValue = new EntitySchema({
    name: "PortfolioHourlyValue",
    tableName: "portfolioHourlyValue",
    columns: columns,
    relations: relations
});

const PortfolioDailyValue = new EntitySchema({
    name: "PortfolioDailyValue",
    tableName: "portfolioDailyValue",
    columns: columns,
    relations: relations
});

const PortfolioWeeklyValue = new EntitySchema({
    name: "PortfolioWeeklyValue",
    tableName: "portfolioWeeklyValue",
    columns: columns,
    relations: relations
});

module.exports = [
    PortfolioHourlyValue,
    PortfolioDailyValue,
    PortfolioWeeklyValue,
]