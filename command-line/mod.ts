import ProgressBar from "https://deno.land/x/progress@v1.2.3/mod.ts";
import { bgGreen, bgWhite } from "https://deno.land/std@0.74.0/fmt/colors.ts";
import { prompt } from "./utils.ts";
import { ensureDir, ensureFile } from "https://deno.land/std/fs/mod.ts";
import utils from "../src/lib/utils.ts";
const { toKebab } = utils;
const userOptions = [
  "Your vno project",
  "App",
  "Hello-Vno",
  "3000",
];
let addedComps: string = "";
const runner: any = async function customize() {
  const msg1: string = "\n Please enter a project title";
  const msg2: string =
    "\n What would you like to name your root Vue component?(recommend App)";
  const msg3: string =
    "\n What would you like to name your additional component?";
  const msg3b: string =
    "\n Would you like to create any additional components?(yes/no)";
  const msg3c: string =
    "\n list the names (seperated by commas) of your additional components";
  const msg5: string = "\n Port number for server";
  const msg6: string =
    "\n Confirm these results and create your project?(yes/no)";

  console.log("\n Initializing your vno project");

  const title: string = await prompt(msg1);
  const root: string = await prompt(msg2);
  const child: string = await prompt(msg3);
  const compQuestion: string = await prompt(msg3b);
  if (compQuestion === "yes") {
    addedComps = await prompt(msg3c);
  }
  const port: string = await prompt(msg5);
  console.log(
    `\n Your Options: \n \n    Title: ${title ||
      userOptions[0]}, \n    Root: ${root ||
      userOptions[1]}, \n    Additional Component(s): ${child + "," +
        addedComps ||
      child ||
      userOptions[2]} \n    Port: ${port || userOptions[4]} \n`,
  );
  const confirm: string = await prompt(msg6);

  if (confirm.toLowerCase() === "yes") {
    if (title) userOptions[0] = title;
    if (root) userOptions[1] = root;
    if (child) userOptions[2] = child;
    if (port) userOptions[4] = port;
  } else {
    console.log("\n Resetting User Options");
    await runner();
  }
};

const decide = "\n Would you like to customize your vno project?(yes/no)";
const decision: string = await prompt(decide);

if (decision.toLowerCase() === "yes") {
  await runner();
} else {
  console.log("Creating vno Project");
}

const total = 100;
const progress = new ProgressBar({
  total,
  complete: bgGreen(" "),
  incomplete: bgWhite(" "),
  display: ":completed/:total hello :time [:bar] :percent",
  clear: true,
});
let completed = 0;
function run() {
  if (completed <= total) {
    progress.render(completed++);

    setTimeout(function () {
      run();
    }, 20);
  }
}
run();

console.log(`Writing root component ${userOptions[1]}.vue`);
const additionalComponent: string = `<template>
<div class="hello">
  <h1>{{ msg }}</h1>
  <p>
    For github documentation:<br>
    
    <a href="https://github.com/oslabs-beta/vno" target="_blank" rel="noopener">&nbsp;vno documentation</a>.
  </p>
  <h3>Installed CLI Plugin</h3>
  <ul>
  <li><a href="https://github.com/oslabs-beta/vno/tree/main/command-line" target="_blank" rel="noopener">babel</a></li>
  </ul>
</div>
</template>
<script>
export default {
  name: '${userOptions[2]}',
  props: {
    msg: String
  },
}
</script>
<style>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #79D0B2;
}
</style>`;

const rootComp: string = `<template>
<div id="${userOptions[1].toLowerCase()}">
<a href="https://ibb.co/mHwdLSK"><img src="https://i.ibb.co/4jGC6JL/image.png" alt="image" border="0" width="450" height="450"></a>
<${userOptions[2]} msg='You are building: ${userOptions[0]} with vno'/>
</div>
</template>
<script>
import ${userOptions[2]} from './components/${userOptions[2]}.vue'
export default {
  name: '${userOptions[1].toLowerCase()}',
  components: {
    ${userOptions[2]}
  }
}
</script>
<style>
#${userOptions[1].toLowerCase()} {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #79D0B2;
  margin-top: 60px;
}
</style>`;

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.12"></script>
    <link rel="stylesheet" href="./style.css">
    <title>${userOptions[0]}</title>
  </head>
  <body>
    <div id="${userOptions[1].toLowerCase()}">
      <!-- built files will be auto injected -->
    </div>
    <script src="https://cdn.jsdelivr.net/npm/vue@2.6.12"></script>
    <script type="module" src='./build.js'></script>
  </body>
</html>
`;

const server: string =
  `import { Application, join, log, send } from "./deps.ts";
import vno from "../src/strategies/renderer.ts";
const port: number = ${userOptions[4]};
const server: Application = new Application();
await vno.config({
  label: "${userOptions[1]}",
  entry: "./",
  cdn: "https://cdn.jsdelivr.net/npm/vue@2.6.12",
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
  log.info("Server is up and running on port ${userOptions[4]}");
  await server.listen({ port });
}
export { server };`;

const deps: string =
  `export { dirname, join } from "https://deno.land/std@0.74.0/path/mod.ts";
export * as log from "https://deno.land/std@0.74.0/log/mod.ts";
export {
  Application,
  Router,
  send,
} from "https://deno.land/x/oak@v6.3.1/mod.ts";
export { config } from "https://deno.land/x/dotenv/mod.ts";
`;
// const appPath: string = "./";
// const componentPath: string = "./components/";
const genericComp: string = `<template>

</template>

<script>
export default {
name: ,

};
</script>
<style>

</style>`;
ensureDir("public");
console.info("Done writing public dir!");

ensureDir("components");
console.log("Done writing component dir!");

// ensureDir("assets");
// console.log("Done writing assets dir!");

ensureFile(`${toKebab(userOptions[1])}.vue`)
  .then(() => {
    Deno.writeTextFile(`${userOptions[1]}.vue`, rootComp);
    console.info(`Done writing ${userOptions[1]} component!`);
  });

ensureFile("public/index.html")
  .then(() => {
    Deno.writeTextFile("public/index.html", html);
    console.info("Done writing html file!");
  });

ensureFile("deps.ts")
  .then(() => {
    Deno.writeTextFile("deps.ts", deps);
    console.info("Done writing deps file!");
  });

ensureFile(`components/${toKebab(userOptions[2])}.vue`)
  .then(() => {
    Deno.writeTextFile(
      `components/${toKebab(userOptions[2])}.vue`,
      additionalComponent,
    );
    console.info("Done writing");
  });
let compsArray = addedComps.split(",");
for (let i = 0; i < compsArray.length; i += 1) {
  ensureFile(`components/${toKebab(compsArray[i])}.vue`)
    .then(() => {
      Deno.writeTextFile(
        `components/${toKebab(compsArray[i])}.vue`,
        `//created component ${toKebab(compsArray[i])}` + "\n" + genericComp,
      );
      console.log(`done writing ${compsArray[i]}.vue`);
    })
    .catch(() => {
      console.log(`error writing component: ${compsArray[i]}.vue`);
    });
}

ensureFile("server.ts")
  .then(() => {
    Deno.writeTextFile("server.ts", server);
    console.info("Done writing server");
  });

console.log(`writing ${userOptions[1]}.vue`);
console.log("DONE!");
