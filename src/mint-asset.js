const fs = require("fs");
const cardano = require("./cardano");

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

// If the asset's destination is ommitted, the wallet's address is assumed
const assetToTxOut = (wallet, policyId, asset) => ({
  address: asset.destination || wallet.paymentAddr,
  value: {
    lovelace: 0,
    ...Object.fromEntries([[assetId(asset.name, policyId), asset.quantity]]),
  },
});

const makeTxOuts = (wallet, policyId, assets) => [
  {
    address: wallet.paymentAddr,
    // value: wallet.balance().value
    value: {
      ...wallet.balance().value,
      // BUG: The commented out code doesn't work for some reason
      // ...assets.map((asset) => assetToTxOut(wallet, policyId, asset)),
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

const makeTransaction = (wallet, policyId, assets, mintScript, metadata) => ({
  txIn: wallet.balance().utxo,
  txOut: makeTxOuts(wallet, policyId, assets),
  mint: makeMint(policyId, mintScript, assets),
  metadata,
  witnessCount: 2,
});

const assets = JSON.parse(fs.readFileSync("assets.json", "utf8"));

const mintAssset = (walletName, assets) => {
  const wallet = cardano.wallet(walletName);

  const mintScript = {
    keyHash: cardano.addressKeyHash(wallet.name),
    type: "sig",
  };

  const POLICY_ID = cardano.transactionPolicyid(mintScript);
  const ASSET_ID = assetId(assets[0].name, POLICY_ID);
  const metadata = makeMetadata(POLICY_ID, assets);
  const tx = makeTransaction(wallet, POLICY_ID, assets, mintScript, metadata);

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

  // console.log(tx);
  // console.log(tx.txOut);
  const raw = buildTransaction(tx);

  const signTransaction = (wallet, tx) => {
    return cardano.transactionSign({
      signingKeys: [wallet.payment.skey, wallet.payment.skey],
      txBody: tx,
    });
  };

  const signed = signTransaction(wallet, raw);

  const txHash = cardano.transactionSubmit(signed);

  console.log(txHash);
};

mintAssset("ADAPI", assets);
