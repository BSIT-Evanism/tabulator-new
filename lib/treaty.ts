import { treaty } from "@elysiajs/eden";
import { App } from "../serverTab/src/index";

export const client = treaty<App>(process.env.BACKEND_URL! || "http://localhost:3002")
