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

Bookmarks.belongsTo(Categories);
Categories.hasMany(Bookmarks);

/* express app*/

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req,res) => res.redirect('/bookmarks'))
app.get('/bookmarks', async(req,res,next) => {
    const bookmarks = await Bookmarks.findAll( {include:[Categories] });
    const categories = await Categories.findByPk((req.params.id), {include:[Bookmarks]});
    const html = bookmarks.map( bookmark => `
    <div>
    ${bookmark.name} <a href = '/categories/categoryName'> ${categories}</a>
    </div>
    `).join('')
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
    `)
})

const start = async () => {
  try {
    console.log('hello world');
    
    app.listen(port, () => {
        console.log(`listening on port ${port}`)
    });

    await sequelize.sync({ force: true });
    await Bookmarks.create({ name: "Google.com" });
    await Bookmarks.create({ name: "Indeed.com" });
    await Bookmarks.create({ name: "stackoverflow.com" });
    await Bookmarks.create({ name: "linkedIn.com" });
    await Bookmarks.create({ name: "msdn.com" });
    await Bookmarks.create({ name: "bing.com" });
    await Categories.create({ name: 'Search'});
    await Categories.create({ name: 'Coding'});ß
    await Categories.create({ name: 'Jobs'});
    console.log(Bookmarks);
  } catch (ex) {
    console.log(ex);
  }
};

start();

