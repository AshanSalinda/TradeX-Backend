const EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Forum-answers",
  tableName: "forum-answers",
  columns: {
    answerId: {
      primary: true,
      type: "int",
      generated: true,
    },
    questionId: {
      type: "int",
    },

    questionTitle: {
      type: "varchar",
      nullable: false,
    },

    username: {
      type: "varchar",
    },
    userId: {
      type: "int",
      nullable: false,
    },
    comment: {
      type: "varchar",
    },
    likes: {
      type: "int",
    },
  },
});
