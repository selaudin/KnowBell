import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import neo4j, { Driver, Session } from "neo4j-driver";
import { conversationResponse, conversation } from "../types/conversation";

dotenv.config();

const app: Application = express();
app.use(express.json());
const port = process.env.PORT || 8000;

export const createDriver = async () => {
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
  closeConnection(driver, session);
  res.json(result);
});

app.get("/login", async (req: Request, res: Response) => {
  const { username, password } = req.query;
  const driver = await createDriver();

  const session = driver.session();

  const { records } = await session.run(
    "MATCH (p:User {surname: $propertyValue, name: $password }) RETURN ID(p) AS userId, p",
    { propertyValue: username, password: password }
  );
  if (records.length <= 0) {
    res.status(401).json({
      response: "Login Failed!",
    });
    closeConnection(driver, session);
    return;
  }
  closeConnection(driver, session);
  res.status(200).json({
    response: "Successfully logged in!",
    userID: records[0].get("userId").toInt(),
  });
});

app.delete("/history", async (req: Request, res: Response) => {
  const { historyID, userID } = req.query;
  const driver = await createDriver();

  const session = driver.session();
  //"MATCH (h:History WHERE ID(h) = $history)-[:HAS_CONVERSATION]->(c:Conversation)-[r]->(relatedNode) DETACH DELETE h, relatedNode",
  
  const result = await session.run(
   "MATCH (h:History WHERE ID(h) = $history)-[:HAS_CONVERSATION]->(c:Conversation) detach delete h, c",
    { history: Number(historyID) }
  );
  closeConnection(driver, session);
  res.status(200).json(await getHistoryByUser(Number(userID)));
});

app.post("/history", async (req: Request, res: Response) => {
  const { userID } = req.query;
  const data = req.body;

  const driver = await createDriver();

  const session = driver.session();
  try {
    const createdUserHistoryRel = await session.run(
      "MATCH (u:User where ID(u) = $userID) CREATE (h:History {createdAt: localdatetime()}) SET h += $history CREATE (u)-[:HAS_HISTORY]->(h)",
      { history: data, userID: Number(userID) }
    );
    closeConnection(driver, session);
    return res.status(200).json({
      response: "Inserted into history",
    });
  } catch (error) {
    closeConnection(driver, session);
    return res.status(500).json({ response: "Failed to insert into history!" });
  }
});

app.get("/history", async (req: Request, res: Response) => {
  const { userID } = req.query;
  /* const driver = await createDriver();
  const session = driver.session();

  const { records } = await session.run(
    "MATCH (p:User where ID(p) = $userIDDB)-[r:HAS_HISTORY]->(h:History) return h, ID(h) as historyID",
    { userIDDB: Number(userID) }
  );

  if (records.length <= 0) {
    return res.status(200).json([]);
  }

  const attributes = records.map((record) => {
    const data = record.get("h");

    return {
      historyID: record.get("historyID").toInt(),
      title: data.properties.title,
      language: data.properties.language,
    };
  }); */

  res.status(200).json(await getHistoryByUser(Number(userID)));
});

app.get("/conversation", async (req: Request, res: Response) => {
  const { historyID } = req.query;
  if (!historyID) {
    return res.status(404).json({
      response: "historyID is required!",
    });
  }
  const driver = await createDriver();
  const session = driver.session();
  const { records } = await session.run(
    "MATCH (h:History where ID(h) = $historyID)-[r:HAS_CONVERSATION]->(c:Conversation) return c, h ORDER BY c.createdAt ASC",
    { historyID: Number(historyID) }
  );
  closeConnection(driver, session);
  if (records.length <= 0) {
    return res.status(404).json({
      response: "No Conversation found!",
    });
  }

  const historyRecord = records[0].get("h");
  const historyTitle = historyRecord.properties.title;

  const allConversations: conversation[] = records.map((record) => {
    const singleRecord = record.get("c");
    const createdAt = singleRecord.properties.createdAt;
    return {
      prompt: singleRecord.properties.prompt,
      request: singleRecord.properties.request,
      docs: singleRecord.properties.docs,
      createdAt: new Date(
        createdAt.year.low,
        createdAt.month.low - 1,
        createdAt.day.low,
        createdAt.hour.low,
        createdAt.minute.low,
        createdAt.second.low,
        createdAt.nanosecond.low / 1000000
      ),
    };
  });

  const conversationResponse: conversationResponse = {
    historyID: Number(historyID),
    title: historyTitle,
    conversations: allConversations,
  };

  return res.status(200).json(conversationResponse);
});

app.post("/conversation", async (req: Request, res: Response) => {
  const { historyID } = req.query;
  const convo = req.body;

  const driver = await createDriver();
  const session = driver.session();

  try {
    const createdConvo = await session.run(
      "MATCH (h:History where ID(h) = $historyID) CREATE (c:Conversation {createdAt: localdatetime()}) SET c += $convo CREATE (h)-[:HAS_CONVERSATION]->(c)",
      { historyID: Number(historyID), convo: convo }
    );
  } catch (error) {
    closeConnection(driver, session);
    return res.status(500).json({
      response: "Failed to create a new conversation",
    });
  }
  closeConnection(driver, session);
  return res.status(200).json({
    response: "Successfully created conversation",
  });
});

const getLLMData = async (request: string) => {
  const requestURL: string = (process.env.LLM_URI as string) + "/search";
  const response = await fetch(requestURL, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    //TODO Error Handling
  }

  return await response.json();
};

const getHistoryByUser = async (userID: Number) => {
  const driver = await createDriver();
  const session = driver.session();

  const { records } = await session.run(
    "MATCH (p:User where ID(p) = $userIDDB)-[r:HAS_HISTORY]->(h:History) return h, ID(h) as historyID",
    { userIDDB: Number(userID) }
  );
  closeConnection(driver, session);

  if (records.length <= 0) {
    return [];
  }

  const attributes = records.map((record) => {
    const data = record.get("h");

    return {
      historyID: record.get("historyID").toInt(),
      title: data.properties.title,
      language: data.properties.language,
    };
  });
  return attributes;
};

const closeConnection = (driver: Driver, session: Session) => {
  session.close();
  driver.close();
};

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
