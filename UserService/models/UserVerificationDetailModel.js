const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
    name: "UserVerificationDetail",
    tableName: "user_verification_detail",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        userId: {
            type: "int"
        },
        firstName: {
            type: "varchar"
        },
        lastName: {
            type: "varchar"
        },
        age: {
            type: "int"
        },
        phoneNumber: {
            type: "varchar"
        },
        nic: {
            type: "varchar"
        },
        dateOfBirth: {
            type: "date"
        },
        userImg: {
            type: "varchar"
        },
        nicImg1: {
            type: "varchar"
        },
        nicImg2: {
            type: "varchar"
        },
        requestDate: {
            type: "date"
        },

    },



});
