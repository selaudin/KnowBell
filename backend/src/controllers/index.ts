import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import neo4j from 'neo4j-driver'
//For env File 
dotenv.config();

export const createDriver = async () => {
  const driver = neo4j.driver(
      String(process.env.NEO4J_URI),
      neo4j.auth.basic(String(process.env.NEO4J_USER), String(process.env.NEO4J_PASSWORD))
  )

  return driver
}

const app: Application = express();
const port = process.env.PORT || 8000;

app.get('/', async (req: Request, res: Response) => {
  const driver = await createDriver();

  const session = driver.session()

  const {records} = await session.run('MATCH (p:User) return p');

  const result = records.map(record => record.get('p'))
  res.json(result)
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});