import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

const privateKey = fs.readFileSync("./certs/private.pem");

// sig means jwk will be used only for to verify the signature
const jwk = rsaPemToJwk(privateKey, { use: "sig" }, "public");

console.log(JSON.stringify(jwk));

// run the file manually through node, so it will show the console
