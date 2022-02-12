const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DATABSE_URL || "postgres://localhost/bookmarks_plus"
);

const Bookmarks = sequelize.define('bookmark', {
  name: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
});

const Categories = sequelize.define('category', {
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull:false,
    },
});

const start = async () => {
  try {
    console.log("hello world");
    await sequelize.sync({ force: true });
    await Bookmarks.create({ name: "Google.com" });
    await Bookmarks.create({ name: "Indeed.com" });
    await Bookmarks.create({ name: "stackoverflow.com" });
    await Bookmarks.create({ name: "linkedIn.com" });
    await Bookmarks.create({ name: "msdn.com" });
    await Bookmarks.create({ name: "bing.com" });
    await Categories.create({ name: 'Search'});
    await Categories.create({ name: 'Coding'});
    await Categories.create({ name: 'Jobs'});
    console.log(Bookmarks);
  } catch (ex) {
    console.log(ex);
  }
};

start();
