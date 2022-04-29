import fs from "fs";
import cardano from "./cardano.js";
import {
  assets,
  wallet,
  invalidAfter,
  mintScript,
  policyId,
  royaltyRate,
  royaltyAddress,
} from "./config.js";
import { makeRoyalty } from "./mint-royalty.js";
import { burnAsset } from "./burn-asset.js";

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const hexAssetName = (assetName) =>
  assetName
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");

const assetId = (assetName, policyId) =>
  policyId + "." + hexAssetName(assetName);

const makeMetadata = (policyId, assets) => ({
  // ERC 721 NFT standard
  721: {
    [policyId]: Object.fromEntries(assets.map((asset) => [asset.name, asset])),
  },
});

const makeTxOuts = (wallet, policyId, assets) => [
  {
    address: wallet.paymentAddr,
    value: {
      ...wallet.balance().value,
      ...Object.fromEntries(
        assets.map((asset) => [assetId(asset.name, policyId), asset.quantity])
      ),
    },
  },
];

const makeMint = (policyId, mintScript, assets) =>
  assets.map((asset) => ({
    action: "mint",
    quantity: asset.quantity,
    asset: assetId(asset.name, policyId),
    script: mintScript,
  }));

const makeTransaction = (
  wallet,
  policyId,
  assets,
  mintScript,
  metadata,
  invalidAfter
) => ({
  txIn: wallet.balance().utxo,
  txOut: makeTxOuts(wallet, policyId, assets),
  mint: makeMint(policyId, mintScript, assets),
  metadata,
  witnessCount: 2,
  invalidAfter,
});

const mintAssset = (wallet, assets, invalidAfter, mintScript) => {
  const metadata = makeMetadata(policyId, assets);
  const tx = makeTransaction(
    wallet,
    policyId,
    assets,
    mintScript,
    metadata,
    invalidAfter
  );

  // Using wallet.balance().utxo puts undefined: NaN into the value
  for (let i = 0; i < tx.txOut.length; i++) {
    if (Object.keys(tx.txOut[i].value).includes("undefined")) {
      delete tx.txOut[i].value.undefined;
    }
  }
  for (let i = 0; i < tx.txIn.length; i++) {
    if (Object.keys(tx.txIn[i].value).includes("undefined")) {
      delete tx.txIn[i].value.undefined;
    }
  }

  const buildTransaction = (tx) => {
    const raw = cardano.transactionBuildRaw(tx);
    const fee = cardano.transactionCalculateMinFee({
      ...tx,
      txBody: raw,
    });

    tx.txOut[0].value.lovelace -= fee;

    return cardano.transactionBuildRaw({ ...tx, fee });
  };

  const raw = buildTransaction(tx);

  const signTransaction = (wallet, tx) => {
    return cardano.transactionSign({
      signingKeys: [wallet.payment.skey, wallet.payment.skey],
      txBody: tx,
    });
  };

  const signed = signTransaction(wallet, raw);

  const txHash = cardano.transactionSubmit(signed);

  console.log("Minted assets hash:" + txHash);
};

console.log("Minting royalty");
makeRoyalty(
  wallet,
  royaltyRate,
  royaltyAddress,
  policyId,
  mintScript,
  invalidAfter
);
// Waiting for the transaction to go through
await sleep(60000);
console.log("Burning royalty token");
burnAsset(wallet, mintScript, policyId, policyId);
await sleep(60000);
console.log("Minting assets");
mintAssset(wallet, assets, invalidAfter, mintScript);
