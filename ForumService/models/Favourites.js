const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Favourites",
  tableName: "favourites",
  columns: {
    questionId: {
      type: "int",
      primary: true,
    },
    userId: {
      type: "int",
    },
    title: {
      type: "varchar",
    },
  },
});
