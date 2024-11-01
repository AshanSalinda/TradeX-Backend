const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Admin",
    tableName: "admin",
    columns: {
        AdminId: {
            primary: true,
            type: "int",
        },
        AdminName: {
            type: "varchar",
        },
        email: {
            type: "varchar",
        },
        password: {
            type: "varchar",
        },
        NIC: {
            type: "varchar",
        },
        Contact: {
            type: "varchar",
        },
        role: {
            type: "varchar",
        },
    },
});