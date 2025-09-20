import { Express} from "express";
import swaggerUi from "swagger-ui-express";
import YAML from 'yamljs';
import path from 'path';

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yml'));

function swaggerDocs(app: Express, port: number | string) {
  // Swagger page
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(`Docs available at http://localhost:${port}/api-docs`);
  
}

export default swaggerDocs;