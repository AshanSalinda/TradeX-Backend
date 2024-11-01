const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "AppNotification",
    tableName: "appNotification",
    columns: {
        notificationId: {
            primary: true,
            type: "int",
            generated: true,
        },
        userId: {
            type: "int",
            nullable: false,
        },
        title: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        body: {
            type: "varchar",
            length: 100,
            nullable: true,
        },
        onClick: {
            type: "varchar",
            nullable: true,
        },
        sentAt: {
            type: "timestamp",
            nullable: false,
        },
        isViewed: {
            type: "boolean",
            default: false,
            nullable: false,
        },
    },
});
