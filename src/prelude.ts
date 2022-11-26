/**
 * @file prelude/index.ts
 * This file exports everything that is considerd useful.
 */
import Application from "./lib/application.js";
import SocketServer from "./lib/server.js";
import handlers from "./lib/handlers/index.js";


export { Application, handlers, SocketServer as Server };