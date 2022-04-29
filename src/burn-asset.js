import cardano from "./cardano.js";
import { wallet, invalidAfter, mintScript } from "./config.js";

const createTransaction = (tx) => {
  let raw = cardano.transactionBuildRaw(tx);
  let fee = cardano.transactionCalculateMinFee({
    ...tx,
    txBody: raw,
  });
  tx.txOut[0].value.lovelace -= fee;
  return cardano.transactionBuildRaw({ ...tx, fee });
};

const signTransaction = (wallet, tx, script) => {
  return cardano.transactionSign({
    signingKeys: [wallet.payment.skey, wallet.payment.skey],
    scriptFile: script,
    txBody: tx,
  });
};

export const burnAsset = (wallet, mintScript, policyId, assetName) => {
  let tx = {
    invalidAfter,
    txIn: wallet.balance().utxo,
    txOut: [
      {
        address: wallet.paymentAddr,
        value: { ...wallet.balance().value, [assetName]: 0 },
      },
    ],
    mint: [
      {
        action: "mint",
        quantity: -1,
        asset: assetName,
        script: mintScript,
      },
    ],
    witnessCount: 2,
  };

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

  let raw = createTransaction(tx);
  let signed = signTransaction(wallet, raw, mintScript);

  let txHash = cardano.transactionSubmit(signed);
  console.log("Burning hash: " + txHash);
};
