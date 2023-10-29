import express, {
  Express,
  Request,
  Response,
  Application,
  request,
} from "express";
import dotenv from "dotenv";
import neo4j, { Driver, Session } from "neo4j-driver";
import {
  conversationResponse,
  conversation,
  createdResponse,
  docs,
} from "../types/conversation";
import axios from "axios";

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
  const result = await session.run(
    "MATCH (h:History WHERE ID(h) = $history)-[:HAS_CONVERSATION]->(c:Conversation) detach delete h, c",
    { history: Number(historyID) }
  );
  closeConnection(driver, session);
  res.status(200).json(await getHistoryByUser(Number(userID)));
});

app.post("/search", async (req: Request, res: Response) => {
  const { userID, historyID } = req.query;
  const data = req.body;

  console.log({ data });
  const convo = req.body;
  const prompt = "Prompt from MML";
  const results: docs[] = [];

  const driver = await createDriver();

  const session = driver.session();

  if (!historyID) {
    const { response, statusCode, hID } = await createHistory(
      Number(userID),
      data[0].question
    );

    if (statusCode === 200) {
      const axiosResponse = await axios.get(
        `http://185.119.87.85:8001/api/questions/get_answer?question=${data[0].question}`
      );

      const mappedAxiosResponse = {
        docs: axiosResponse.data.results.source_documents.map((document: any) => document[1][1].source),
        prompt: axiosResponse.data.results.result,
        request: data[0].question,
      }

      console.log({mappedAxiosResponse});

      const createdHistoryConversationResponse = await session.run(
        "MATCH (h:History) WHERE ID(h) = $hID CREATE (c:Conversation {createdAt: localdatetime()}) SET c += $conversation CREATE (h)-[:HAS_CONVERSATION]->(c)",
        { conversation: mappedAxiosResponse, hID: Number(hID) }
      );
      return res.json(mappedAxiosResponse);
    }
  } else {
    const appendHistoryConversationRel = await session.run(
      "MATCH (h:History) WHERE ID(h) = $history CREATE (c:Conversation {createdAt: localdatetime()}) SET c += $conversation CREATE (h)-[:HAS_CONVERSATION]->(c)",
      { conversation: data, history: Number(historyID) }
    );
    return res.json(appendHistoryConversationRel);
  }
});

async function createHistory(
  userID: number,
  question: string
): Promise<createdResponse> {
  const driver = await createDriver();

  const session = driver.session();

  const axiosResponse = await axios.get(
    `http://185.119.87.85:8001/api/questions/get_title?question=${question}`
  );
  console.log(axiosResponse);

  if (axiosResponse.status !== 200) {
    const response = {
      statusCode: 500,
      response: "Failed to fetch title",
    };
    return response;
  }
  const responseData = axiosResponse.data;
  const allTitles = responseData.title
    .split("\n")
    .filter((step: any) => step.trim() !== "");

  let historyData = {
    title: allTitles[0],
  };
  try {
    const createdUserHistoryRel = await session.run(
      "MATCH (u:User) WHERE ID(u) = $uID CREATE (h:History {createdAt: localdatetime()}) SET h += $history CREATE (u)-[:HAS_HISTORY]->(h) return ID(h) as nodeId",
      { history: historyData, uID: userID }
    );
    const historyID: number = createdUserHistoryRel.records[0].get("nodeId");
    const response = {
      statusCode: 200,
      response: "Successfully created History",
    };
    return {
      response: response,
      hID: historyID,
      statusCode: 200,
    };
  } catch (error) {
    const response = {
      statusCode: 500,
      response: "Error creating History",
    };

    return {
      response,
      hID: null,
      statusCode: 200,
    };
  }
}

app.get("/history", async (req: Request, res: Response) => {
  const { userID } = req.query;

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
  //Search search from frontend
  const convo = req.body;
  const prompt = "Prompt from MML";
  const results: docs[] = [];

  const convoObj: conversation = {
    prompt: prompt,
    request: req.body,
    docs: results,
  };

  const addConvoResponse: createdResponse = await addConversation(
    convo,
    Number(historyID)
  );

  return res
    .status(addConvoResponse.statusCode)
    .json(addConvoResponse.response);
});

const addConversation = async (
  conversationData: conversation,
  historyID: number
) => {
  const driver = await createDriver();
  const session = driver.session();
  try {
    const createdConvo = await session.run(
      "MATCH (h:History where ID(h) = $historyID) CREATE (c:Conversation {createdAt: localdatetime()}) SET c += $convo CREATE (h)-[:HAS_CONVERSATION]->(c)",
      { historyID: Number(historyID), convo: conversationData }
    );
    closeConnection(driver, session);
    const response: createdResponse = {
      statusCode: 200,
      response: {
        response: "Successfully created conversation",
      },
    };
    return response;
  } catch (error) {
    closeConnection(driver, session);
    const response: createdResponse = {
      statusCode: 500,
      response: {
        response: "Failed to create conversation!",
      },
    };
    return response;
  }
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
