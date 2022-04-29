import cardano from "./cardano.js";
import fs from "fs";

export const assets = JSON.parse(fs.readFileSync("assets.json", "utf8"));
export const wallet = cardano.wallet("ADAPI");
export const invalidAfter = cardano.queryTip().slot + 1000;
export const mintScript = {
  type: "all",
  scripts: [
    {
      type: "before",
      slot: invalidAfter,
    },
    {
      keyHash: cardano.addressKeyHash(wallet.name),
      type: "sig",
    },
  ],
};
export const policyId = cardano.transactionPolicyid(mintScript);
export const royaltyAddress = wallet.paymentAddr;
export const royaltyRate = "0.1";
