#!/usr/bin/env node

import Clt from "../lib/clt.js";
import * as pt from "path";

import { createRequire } from "module";

const require = createRequire(import.meta.url);

const packageJSON = require("../package.json");
var pkg = require("../package.json");

var clt = new Clt({
  runnerDir: new URL("../cmds", import.meta.url).pathname,
  name: "clt",
  description: pkg.description,
  version: pkg.version,
});

clt.run();
