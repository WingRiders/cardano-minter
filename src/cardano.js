const CardanocliJs = require("cardanocli-js");
const path = require("path");

const dir = path.join(__dirname, "..");
const shelleyPath = path.join(dir, "testnet-shelley-genesis.json");

const cardanocliJs = new CardanocliJs({
  network: "testnet-magic 1097911063",
  dir,
  shelleyGenesisPath: shelleyPath,
});

module.exports = cardanocliJs;
