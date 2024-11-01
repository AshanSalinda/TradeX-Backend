const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Summary",
  tableName: "summary",
  columns: {
    coinId: {
      primary: true,
      type: "int",
      generated: true,
    },
    coinName: {
      type: "varchar",
    },
  },
});
