import cardano from "./cardano.js";
import fs from "fs";

export const assets = JSON.parse(fs.readFileSync("assets.json", "utf8"));
export const wallet = cardano.wallet("ADAPI");
export const invalidAfter = cardano.queryTip().slot + 10000;
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
export const royaltyAddress =
  "addr1q89w9kpgsytcm9wag2nf28kuqgd3aq28fz6wzqzxhqvccv9vmdd9sz8mxfqx0vqderjejg22grwvgakn0ukhkudtflss48yy94";
export const royaltyRate = "0.8";
