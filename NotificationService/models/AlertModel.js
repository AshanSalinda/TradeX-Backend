const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Alert",
    tableName: "alert",
    columns: {
        alertId: {
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
        condition: {
            type: "varchar",
            length: 10,
            nullable: false,
        },
        price: {
            type: "float",
            nullable: false,
        },
        emailActiveStatus: {
            type: "boolean",
            nullable: false,
        },
        runningStatus: {
            type: "boolean",
            nullable: false,
        },
    },
    relations: {
        deviceToken: {
            type: "many-to-one",
            target: "DeviceToken",
            joinColumn: { name: "userId" },
        },
    },
});
