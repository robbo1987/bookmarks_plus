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
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.redirect("/bookmarks"));

app.delete("/bookmarks/:id", async (req, res, next) => {
  const bookmark = await Bookmarks.findByPk(req.params.id);
  await bookmark.destroy();
  res.redirect(`/categories/${bookmark.categoryId}`);
});

app.post("/bookmarks", async (req, res, next) => {
  try {
    const bookmark = await Bookmarks.create(req.body);

    res.redirect(`/categories/${bookmark.categoryId}`);
  } catch (ex) {
    next(ex);
  }
});

app.get("/bookmarks", async (req, res, next) => {
  try {
    const bookmarks = await Bookmarks.findAll({ include: [Categories] });
    const categories = await Categories.findAll();

    const html = bookmarks
      .map((bookmark) => {
        return `
        <div>
        ${bookmark.name} 
        <a href = '/categories/${bookmark.categoryId}'> ${bookmark.category.name} </a>
        </div>
        `;
      })
      .join("");

    res.send(`
    <html>
       

        <head>
            <title> ACME Bookmarks Page</title>
            <h1> ACME Bookmarks Page</h1>
            <div>
            <form method='POST'>
            <input name='name' placeholder='name of bookmark' />
            <select name='categoryId'>
            ${categories
              .map((category) => {
                return `<option value='${category.id}'>${category.name} </option>`;
              })
              .join("")}
            </select>
            <button>Create</button
            </form> 
            </div>
                ${html}
        </head>
    </html>
    `);
  } catch (ex) {
    next(ex);
  }
});

app.get("/categories/:id", async (req, res, next) => {
  try {
    const category = await Categories.findByPk(req.params.id, {
      include: [Bookmarks],
    });
    const html = category.bookmarks
      .map((bookmark) => {
        return `
     <div>
     ${bookmark.name}
     <form method = 'POST' action = '/bookmarks/${bookmark.id}?_method=delete'>
      <button>X</button>
        </div>`;
      })
      .join("");
    res.send(`
   <html>
    <head>
      <title> Acme Bookmarks</title>
    </head>
      <body>
      <h1> ACME BOOKMARKS <h1>
      <h2> ${category.name}</h2>
      <a href = '/bookmarks'>BACK</a>
      ${html}
      </body>
   </html>
    `);
  } catch (ex) {
    next(ex);
  }
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
    await Bookmarks.create({ name: "MSDN.com", categoryId: coding.id });
    await Bookmarks.create({ name: "Bing.com", categoryId: search.id });
  } catch (ex) {
    console.log(ex);
  }
};

start();
