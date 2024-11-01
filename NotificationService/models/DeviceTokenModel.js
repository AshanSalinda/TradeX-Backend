const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "DeviceToken",
    tableName: "deviceToken",
    columns: {
        userId: {
            primary: true,
            type: "int",
            nullable: false,
        },
        deviceToken: {
            type: "varchar",
            length: 255,
            nullable: false,
        }
    },
});
