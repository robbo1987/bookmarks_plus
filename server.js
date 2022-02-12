const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DATABSE_URL || "postgres://localhost/bookmarks_plus"
);

const Bookmarks = sequelize.define("bookmark", {
  name: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
});

const Categories = sequelize.define("category", {
  name: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
});

Bookmarks.belongsTo(Categories);
Categories.hasMany(Bookmarks);

/* express app*/

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => res.redirect("/bookmarks"));
app.get("/bookmarks", async (req, res, next) => {
  const bookmarks = await Bookmarks.findAll({ include: [Categories] });

  const html = bookmarks
    .map((bookmark) => {
      const div = `
        <div>
        ${bookmark.name} <a href = '/categories/categoryName'> ${bookmark.category.name} </a>
        </div>
        `;
      return div;
    })
    .join("");

  res.send(`
    <html>
        <head>
            <title> ACME Bookmarks Page</title>
            <h1> ACME Bookmarks Page</h1>
            <ul>
                ${html}
            </ul>
        </head>
    </html>
    `);
});

const start = async () => {
  try {
    console.log("hello world");

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });

    await sequelize.sync({ force: true });
    const search = await Categories.create({ name: "Search" });
    const coding = await Categories.create({ name: "Coding" });
    const jobs = await Categories.create({ name: "Jobs" });
    await Bookmarks.create({ name: "Google.com", categoryId: search.id });
    await Bookmarks.create({ name: "Indeed.com", categoryId: coding.id });
    await Bookmarks.create({ name: "stackoverflow.com", categoryId: jobs.id });
    await Bookmarks.create({ name: "linkedIn.com", categoryId: jobs.id });
    await Bookmarks.create({ name: "msdn.com", categoryId: coding.id });
    await Bookmarks.create({ name: "bing.com", categoryId: search.id });
  } catch (ex) {
    console.log(ex);
  }
};

start();
