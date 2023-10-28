import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import neo4j from "neo4j-driver";
dotenv.config();

const app: Application = express();
app.use(express.json());
const port = process.env.PORT || 8000;

export const createDriver = async () => {
  console.log(process.env.NEO4J_URI, process.env.NEO4J_USER);
  const driver = neo4j.driver(
    String(process.env.NEO4J_URI),
    neo4j.auth.basic(
      String(process.env.NEO4J_USER),
      String(process.env.NEO4J_PASSWORD)
    )
  );

  return driver;
};

app.get("/", async (req: Request, res: Response) => {
  const driver = await createDriver();

  const session = driver.session();

  const { records } = await session.run("MATCH (p:User) return p");

  const result = records.map((record) => record.get("p"));
  res.json(result);
});

app.get("/login", async (req: Request, res: Response) => {
  const { username, password } = req.query;
  const driver = await createDriver();

  const session = driver.session();

  const { records } = await session.run(
    "MATCH (p:User {surname: $propertyValue, name: $password }) return p",
    { propertyValue: username, password: password }
  );

  if (records.length <= 0) {
    res.status(401).send("Login Failed!");
    return;
  }

  res.status(200).send("Sucessfully logged in as " + username);
});

app.delete("/history", async (req: Request, res: Response) => {
  const { id } = req.query;
  const driver = await createDriver();

  const session = driver.session();

  const result = await session.run(
    "MATCH (h:History) WHERE ID(h) = $history DETACH DELETE h",
    { history: Number(id) }
  );

  res.status(200).end();
});

app.post("/history", async (req: Request, res: Response) => {
  const { userID } = req.query;
  const data = req.body;

  const driver = await createDriver();

  const session = driver.session();

  const createdUserHistoryRel = await session.run(
    "MATCH (u:User {surname : 'Doe'}) CREATE (h:History {createdAt: localdatetime()}) SET h += $history CREATE (u)-[:HAS_HISTORY]->(h)",
    { history: data }
  );

  return res.json(createdUserHistoryRel)
});

app.get("/history", async (req: Request, res: Response) => {
  const { userID } = req.query;
  const driver = await createDriver();
  const session = driver.session();
  console.log(userID);

  const { records } = await session.run(
    "MATCH (p:User where ID(p) = $userIDDB)-[r:HAS_HISTORY]->(h:History) return h",
    { userIDDB: Number(userID) }
  );

  if (records.length <= 0) {
    return res.status(200).json([]);
  }

  const attributes = records.map((record) => {
    const data = record.get("h");
    return {
      title: data.properties.title,
      description_uri: data.properties.description_uri,
      language: data.properties.language,
    };
  });

  res.json(attributes);
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
