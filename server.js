// IMPORTS
import process from "process";

import multer from "multer";
const upload = multer({ dest: "./tmp/" });

import crypto from "crypto";

import { MongoClient } from "mongodb";
import { fsHelper } from "./utils/fs-helper.mjs";

// ---------------------------------------------------------------------
// mongo-cnxn string.
const cnxn_str =
  "mongodb+srv://dibyasom:Rexu2020@cluster0.yjkez.mongodb.net/reskill?retryWrites=true&w=majority";

// ---------------------------------------------------------------------
import path from "path";
const __dirname = path.resolve();

// ---------------------------------------------------------------------
// RateLimit - Prevent DoS attack - 15Minutes, 100Req(s) per IP.
import rateLimit from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// ---------------------------------------------------------------------
// Express config.
import express from "express";
const app = express();

// Logging formatter.
import morgan from "morgan";
app.use(morgan("dev"));

// HTTP security.
import helmet from "helmet";
app.use(helmet());

// Limiter
app.use(limiter);

// Accept JSON
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// set the view engine to ejs
app.set("view engine", "ejs");

// ---------------------------------------------------------------------
// Fetch PORT from env, else 8080
const server_port = process.env.YOUR_PORT || process.env.PORT || 8080;
const server_host = process.env.YOUR_HOST || "0.0.0.0";

const init = async () => {
  // Establish Mongo cnxn
  // ---------------------------------------------------------------------
  const client = new MongoClient(cnxn_str, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();

  // Mongo-Helper
  // ---------------------------------------------------------------------
  const addUserToMongo = async (client, newUser, errRes) => {
    const db = await client.db("reskill");
    const collection = await db.collection("users");

    collection.insertOne(newUser, function (err, res) {
      if (err) errRes(err);
      console.log("1 record inserted.");
    });
  };

  const getTenFromMongo = async (client) => {
    const db = await client.db("reskill");
    const collection = await db.collection("users");

    return await collection.find().limit(20).toArray();
  };

  // ---------------------------------------------------------------------

  app.get("/register", (req, res) => {
    res.render("form");
  });

  app.post("/register", upload.single("avatar"), (req, res) => {
    // Validate Data.
    if (req.body.email && req.body.email !== "") {
      var emailHash = crypto
        .createHash("md5")
        .update(req.body.email)
        .digest("hex");

      // ''' Add user-email to Mongo, with the hash as ID. '''
      try {
        addUserToMongo(
          client,
          { _id: emailHash, email: req.body.email, name: req.body.name },
          (err) => console.log(err)
        );

        // Save image to fs.
        try {
          fsHelper(
            emailHash,
            __dirname,
            req,
            (msg) => res.json({ attr: req.body, msg: msg }).end(),
            (err, code) => res.status(code).json({ err: err }).end()
          );
        } catch (err) {
          // Writing user-avatar to fs failed. //
          console.log(`Saving user-avatar failed | @${req.body.email}`, err);
        }
      } catch (err) {
        //   Adding user-email to Mongo failed. //
        console.log(`Saving user-email failed | @${req.body.email}`, err);
      }
    }
  });

  // ---------------------------------------------------------------------
  app.get("/explore", async (req, res) => {
    let result = await getTenFromMongo(client);
    // res.status(200).json({ res: result }).end();
    console.log(result);
    res.render("explore", { users: result });
  });

  // ---------------------------------------------------------------------
  // Start-server
  app.listen(server_port, server_host, () => {
    console.log("Listening on port %d", server_port);
  });

  // ---------------------------------------------------------------------

  const cleanup = (event) => {
    //   Terminate mongo cnxn.
    client.close();
    process.exit();
  };

  // Termination events.
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  //   Start server.
  console.log(`Server is listening on port ${server_port}`);
  console.log(`http://127.0.0.1:${server_port}/register`);
};

// Entrypoint
init();
