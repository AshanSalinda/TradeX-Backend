const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "User",
  tableName: "user",
  columns: {
    userId: {
      primary: true,
      type: "int",
      generated: true,
    },
    userName: {
      type: "varchar",
      nullable: true,
    },
    email: {
      type: "varchar",
      nullable: true,
    },
    password: {
      type: "varchar",
    },
    issue: {
      type: "varchar",
    },
    hasTakenQuiz: {
      type: "boolean",
    },
    level: {
      type: "varchar",
    },
    role: {
      type: "varchar",
    },
  },
});

