import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import neo4j from "neo4j-driver";
//For env File
dotenv.config();

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

const app: Application = express();
const port = process.env.PORT || 8000;

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

app.post("/query", async (req: Request, res: Response) => {
  const driver = await createDriver();

  const session = driver.session();

  const createdRec = await session.run(
    "CREATE (p:User {surname : 'Doe', name: 'John'}) RETURN p.name AS name"
  );

  console.log(createdRec);
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
