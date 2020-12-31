import { Application, join, log, send } from "./deps.ts";
import vno from "../src/strategies/renderer.ts";
const port: number = 8080;
const server: Application = new Application();
await vno.config({
  label: TestRoot,
  entry: "./",
  cdn: https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js,
});
server.use(async (ctx, next) => {
  const filePath = ctx.request.url.pathname;
  if (filePath === "/") {
    await send(ctx, ctx.request.url.pathname, {
      root: join(Deno.cwd(), "public"),
      index: "index.html",
    });
  } else if (filePath === "/build.js") {
    ctx.response.type = "application/javascript";
    await send(ctx, filePath, {
      root: join(Deno.cwd(), "vno-build"),
      index: "build.js",
    });
  } else if (filePath === "/style.css") {
    ctx.response.type = "text/css";
    await send(ctx, filePath, {
      root: join(Deno.cwd(), "vno-build"),
      index: "style.css",
    });
  } else await next();
});
if (import.meta.main) {
  log.info("Server is up and running on port" + 8080 );
  await server.listen(8080);
}
export { server };