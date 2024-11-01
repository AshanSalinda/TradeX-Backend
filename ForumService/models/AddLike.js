const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Like",
  tableName: "like",
  columns: {
    questionId: {
      type: "int",
      nullable: false,
      primary: true,
    },
    userId: {
      type: "int",
      nullable: false,
      primary: true,
    },
  },
});
