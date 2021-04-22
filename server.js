const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const querystring = require("querystring");
const hbs = require("express-hbs");

const dirJSON = `JSON`;

app.use(express.static(path.join(__dirname, "/public")));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

app.get("/", function (req, res) {
  fs.readdir(dirJSON, (err, files) => {
    if (err) {
      return res.render("error", {
        title: err.name || "Error",
        message: err.message || "Wooops, some thing wrong",
      });
    }
    const names = files.map((file) => {
      const [name] = file.split(".json");
      return name;
    });
    res.render("index", {
      names,
    });
  });
});

app.get("/:file", function (req, res) {
  const path = `${__dirname}/${dirJSON}/${req.params.file}.json`;
  fs.exists(path, function (exists) {
    if (exists) {
      fs.readFile(path, function (err, data) {
        if (err) {
          return res.render("error", {
            title: err.name || "Error",
            message: err.message || "Wooops, some thing wrong",
          });
        }
        res.render("gif", {
          gifs: JSON.parse(data),
        });
      });
    }
  });
});

fs.exists(dirJSON, function (exists) {
  if (!exists) {
    fs.mkdirSync(dirJSON);
  }
});

app.post("/gif-search", function (req, res) {
  const base = "https://api.giphy.com/v1/gifs/search?";
  const searchValue = req.body.search.value;

  const apiUrl = querystring.stringify({
    q: searchValue,
    api_key: "oBfOe7CMFy8USb5iDwAmPVDHheJpiobL",
    rating: "g",
    limit: "10",
  });

  fetch(base + apiUrl)
    .then((response) => {
      return response.json();
    })
    .then(({ data }) => {
      const gifs = data.map(({ id, title, images }) => {
        return {
          img: images.original,
          id,
          title,
        };
      });
      const path = `${__dirname}/${dirJSON}/${searchValue}.json`;
      fs.writeFile(path, JSON.stringify(gifs), (err) => {
        if (err) {
          return res.render("error", {
            title: err.name || "Error",
            message: err.message || "Wooops, some thing wrong",
          });
        }

        res.render("gif", {
          gifs,
        });
      });
    })
    .catch((err) => {
      if (err) {
        return res.render("error", {
          title: err.name || "Error",
          message: err.message || "Wooops, some thing wrong",
        });
      }
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
