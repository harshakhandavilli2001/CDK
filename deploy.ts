// deploy.ts
import { ENV } from "./env";
import { execSync } from "child_process";

// Set AWS credentials BEFORE CDK starts
process.env.AWS_ACCESS_KEY_ID = ENV.accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = ENV.secretAccessKey;
process.env.AWS_REGION = ENV.region;
process.env.AWS_DEFAULT_REGION = ENV.region;

console.log("Deploying using env.ts credentials...");

// Run CDK CLI
execSync("cdk deploy FriendStack", { stdio: "inherit" });
