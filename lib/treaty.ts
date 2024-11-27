import { treaty } from "@elysiajs/eden";
import { App } from "../serverTab/src/index";

export const client = treaty<App>("http://localhost:3002");
