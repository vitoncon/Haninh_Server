import { RouterConfigs } from "src/configs/routerConfig.config";
import { Permissions } from "src/configs/permission.config";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "@services/auth.service";
import userRoleService from "@services/userRole.service";
import { Role } from "@interfaces/role.interface";
import { Permission } from "@interfaces/permissions.interface";

type permissionResponse = "forbidden" | "allowed" | "notFound";
type Method = "GET" | "POST" | "DELETE" | "PUT";
class Middleware {
  constructor() {
    // Bind `this` vào constructor, để đảm bảo phương thức này luôn giữ đúng ngữ cảnh.
    this.GuardMiddleware = this.GuardMiddleware.bind(this);
    this.checkIsPublic = this.checkIsPublic.bind(this);
  }
  //1. check table is public
  /*
    when table is public user only get. cant create, update and delete
    */
  checkIsPublic(router: string): boolean {
    try {
      // console.log(router);

      let table = RouterConfigs[router];
      // console.log(table);

      if (!table) return false;
      if (table.isPublic) return true;
      return false;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  // 2. check user is authenticated

  // 3. check role user can access tables
  async checkPermissionTable(
    decode: { id: number; roles: number[] },
    router: string,
    method: Method
  ): Promise<permissionResponse> {
    let table = RouterConfigs[router]; // get router and table
    if (!table) return "notFound";
    let permission: Permission[] = Permissions.filter(
      (item) =>
        item.table_name === table.table && decode.roles.includes(item.role_id)
    );
    // console.log(permission);

    if (!permission || permission.length <= 0) return "forbidden";

    // Tiến hành các kiểm tra hoặc xử lý tiếp theo
    if (method === "GET") {
      for (let index = 0; index < permission.length; index++) {
        if (permission[index].pms[0] === 1) return "allowed";
      }
      return "forbidden";
    }

    if (method === "POST") {
      // Tương tự với POST
      for (let index = 0; index < permission.length; index++) {
        if (permission[index].pms[1] === 1) return "allowed";
      }
      return "forbidden";
    }

    if (method === "PUT") {
      // Kiểm tra với PUT
      for (let index = 0; index < permission.length; index++) {
        if (permission[index].pms[2] === 1) return "allowed";
      }
      return "forbidden";
    }

    if (method === "DELETE") {
      // Kiểm tra với DELETE
      for (let index = 0; index < permission.length; index++) {
        if (permission[index].pms[3] === 1) return "allowed";
      }
      return "forbidden";
    }
    return "forbidden";
  }

  // check middleware
  async GuardMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      // console.log("voooo");

      const method = req.method as Method; // Lấy phương thức HTTP (GET, POST, PUT, DELETE)
      // check ispublic
      const router = req.params.router;

      // console.log(method);
      // console.log(router);

      if (!router || !method) {
        // console.log("run 1");

        return res.status(400).json({ error: "Not found router or method" });
      }
      // console.log('run 2');

      let isPublic = this.checkIsPublic(router);
      // console.log(isPublic);

      if (isPublic && method === "GET") {
        next();
        return;
      }

      // check user is authenticated
      if (!req.headers.authorization)
        return res.status(401).json("invalid access token");
      const token = req.headers.authorization.split(" ")[1]; //get token
      // console.log("token :", token);
      // console.log("env access token : ",process.env.ACCESS_TOKEN_SECRET);
      const decode = await AuthService.verifyAccessToken(token);

      if (decode === "jwt expired") {
        console.log("access token expired");
        return res.status(401).json("access token expired");
      } else if (!decode) return res.status(401).json("invalid access token");

      req.body.decode = decode;

      //check role user can access tables
      let pms: permissionResponse = await this.checkPermissionTable(
        decode,
        router,
        method
      );
      if (pms === "forbidden") {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      if (pms === "notFound") {
        res.status(404).json({ error: "Table not found" });
        return;
      }

      // Tiến hành tiếp tục nếu được phép
      next();
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

  MiddlewareClient(routerParam: string) {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<any> => {
      try {
        // console.log("voooo");

        const method = req.method as Method; // Lấy phương thức HTTP (GET, POST, PUT, DELETE)
        // check ispublic
        const router = routerParam || req.params.router; // Nếu không truyền vào thì lấy từ req.params

        // console.log(method);
        // console.log(router);

        if (!router || !method) {
          // console.log("run 1");
          return res.status(400).json({ error: "Not found router or method" });
        }
        // console.log('run 2');

        let isPublic = this.checkIsPublic(router);
        // console.log(isPublic);

        if (isPublic && method === "GET") {
          next();
          return;
        }

        // check user is authenticated
        if (!req.headers.authorization)
          return res.status(401).json("invalid access token");
        const token = req.headers.authorization.split(" ")[1]; //get token
        // console.log("token :", token);
        // console.log("env access token : ",process.env.ACCESS_TOKEN_SECRET);
        const decode = await AuthService.verifyAccessToken(token);

        if (decode === "jwt expired") {
          // console.log("access token expired");
          return res.status(401).json("access token expired");
        } else if (!decode) return res.status(401).json("invalid access token");

        req.body.decode = decode;

        //check role user can access tables
        let pms: permissionResponse = await this.checkPermissionTable(
          decode,
          router,
          method
        );
        if (pms === "forbidden") {
          res.status(403).json({ error: "Forbidden" });
          return;
        }

        if (pms === "notFound") {
          res.status(404).json({ error: "Table not found" });
          return;
        }

        // Tiến hành tiếp tục nếu được phép
        next();
      } catch (error) {
        res.status(500).json({ error: error });
      }
    };
  }

  async checkLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      if (!req.headers.authorization) {
        
        return res.status(401).json("Invalid access token");
      }
  
      const token = req.headers.authorization.split(" ")[1];
      const decode = await AuthService.verifyAccessToken(token);
  
      if (decode === "jwt expired") {
        return res.status(401).json("Access token expired");
      } else if (!decode) {
        return res.status(401).json("Invalid access token");
      }
  
      req.body.decode = decode; // Gán `decode` vào `req.body` nếu cần
      next(); // Nếu hợp lệ, gọi `next`
    } catch (error) {
      console.error(error);
      next(error); // Truyền lỗi vào Express error handler
    }
  }

  async GuardDestroyMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      

      // check user is authenticated
      if (!req.headers.authorization)
        return res.status(401).json("invalid access token");
      const token = req.headers.authorization.split(" ")[1]; //get token
      // console.log("token :", token);
      // console.log("env access token : ",process.env.ACCESS_TOKEN_SECRET);
      const decode = await AuthService.verifyAccessToken(token);

      if (decode === "jwt expired") {
        console.log("access token expired");
        return res.status(401).json("access token expired");
      } else if (!decode) return res.status(401).json("invalid access token");

      req.body.decode = decode;

      const router = req.params.router;
      let table = RouterConfigs[router];
      let permission: Permission[] = Permissions.filter(
        (item) =>
          item.table_name === table.table && decode.roles.includes(item.role_id)
      );
      for (let index = 0; index < permission.length; index++) {
        if (permission[index].pms[4] === 1) {
          next();
          return;
        }
      }
      
      return res.status(403).json({ error: "Forbidden" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
  
}

export default new Middleware();
