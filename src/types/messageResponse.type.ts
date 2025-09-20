export type messageResponse =
  | "forbidden"
  | "success"
  | "not_found"
  | "bad_request"
  | "unauthorized"
  | "internal_server_error"
  | "unprocessable_entity";
