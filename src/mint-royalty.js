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

const chunkSubstr = (str, size) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};

const makeRoyalty = (
  wallet,
  royaltyRate,
  royaltyAddress,
  policyId,
  mintScript,
  invalidAfter
) => {
  const royaltyMetadata = {
    777: {
      rate: royaltyRate,
      address: chunkSubstr(royaltyAddress, 64),
    },
  };

  // That may be obsolete
  const royaltyTx = {
    txIn: wallet.balance().utxo,
    txOut: [
      {
        address: wallet.paymentAddr,
        value: { ...wallet.balance().value, [policyId]: 1 },
      },
    ],
    mint: [
      {
        action: "mint",
        quantity: 1,
        asset: policyId,
        script: mintScript,
      },
    ],
    metadata: royaltyMetadata,
    witnessCount: 2,
    invalidAfter,
  };

  // Using wallet.balance().utxo puts undefined: NaN into the value
  for (let i = 0; i < royaltyTx.txOut.length; i++) {
    if (Object.keys(royaltyTx.txOut[i].value).includes("undefined")) {
      delete royaltyTx.txOut[i].value.undefined;
    }
  }
  for (let i = 0; i < royaltyTx.txIn.length; i++) {
    if (Object.keys(royaltyTx.txIn[i].value).includes("undefined")) {
      delete royaltyTx.txIn[i].value.undefined;
    }
  }

  const raw = cardano.transactionBuildRaw(royaltyTx);
  const fee = cardano.transactionCalculateMinFee({
    ...royaltyTx,
    txBody: raw,
  });
  royaltyTx.txOut[0].value.lovelace -= fee;
  const rawRoyalty = cardano.transactionBuildRaw({ ...royaltyTx, fee });

  const signedRoyalty = cardano.transactionSign({
    signingKeys: [wallet.payment.skey, wallet.payment.skey],
    txBody: rawRoyalty,
  });

  const royaltyTxHash = cardano.transactionSubmit(signedRoyalty);
  console.log("Royalty hash: " + royaltyTxHash);
};

makeRoyalty(
  wallet,
  royaltyRate,
  royaltyAddress,
  policyId,
  mintScript,
  invalidAfter
);
