import { Application } from "./prelude.js";

(async () => {
    await Application();
})().catch((e) => console.error(e));