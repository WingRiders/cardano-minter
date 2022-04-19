const cardano = require("./cardano");

const hexAssetName = (assetName) =>
  assetName
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");

const assetId = (assetName, policyId) =>
  policyId + "." + hexAssetName(assetName);

const makeMetadata = (policyId, assets) => ({
  721: {
    [policyId]: {
      ...Object.fromEntries(assets.map((asset) => [asset.name, asset])),
    },
  },
});

const makeTransaction = (wallet, policyId, assets, mintScript, metadata) => {
  const txOuts = [
    {
      address: wallet.paymentAddr,
      value: {
        ...wallet.balance().value,
        ...Object.fromEntries(
          assets.map((asset) => [assetId(asset.name, policyId), 1])
        ),
      },
    },
  ];

  const mint = assets.map((asset) => ({
    action: "mint",
    quantity: 1,
    asset: assetId(asset.name, policyId),
    script: mintScript,
  }));

  return {
    txIn: wallet.balance().utxo,
    txOut: txOuts,
    mint: mint,
    metadata,
    witnessCount: 2,
  };
};

assets = [
  {
    name: "AssetName2",
    image: "ipfs://QmUxRuzTi3UZS33rfqXzbD4Heut7zwtGUhuD7qSv7Qt584",
    description: "NFT",
    type: "image/png",
    src: "ipfs://QmUxRuzTi3UZS33rfqXzbD4Heut7zwtGUhuD7qSv7Qt584",
    authors: ["WingRiders"],
  },
  {
    name: "AssetName3",
    image: "ipfs://QmUxRuzTi3UZS33rfqXzbD4Heut7zwtGUhuD7qSv7Qt584",
    description: "NFT",
    type: "image/png",
    src: "ipfs://QmUxRuzTi3UZS33rfqXzbD4Heut7zwtGUhuD7qSv7Qt584",
    authors: ["WingRiders"],
  },
];

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

  // What's that
  if (
    Object.keys(tx.txOut[0].value).includes("undefined") ||
    Object.keys(tx.txIn[0].value.includes("undefinded"))
  ) {
    delete tx.txOut[0].value.undefined;
    delete tx.txIn[0].value.undefined;
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

  console.log(tx);
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
