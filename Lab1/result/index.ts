import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const myname = config.require("myname");
const mysecret = config.require("mysecret");

const opt = config.get("optional") || "defaultValue";

export const name = myname;
export const secret = mysecret;
