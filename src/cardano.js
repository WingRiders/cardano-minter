import CardanocliJs from "cardanocli-js";
import path from "path";

const dir = path.join(__dirname, "..");

const shelleyPath = process.env.CARDANO_MAINNET
  ? path.join(dir, "mainnet-shelley-genesis.json")
  : path.join(dir, "testnet-shelley-genesis.json");
const network = process.env.CARDANO_MAINNET
  ? "mainnet"
  : "testnet-magic 1097911063";
const cardanocliJs = new CardanocliJs({
  network: network,
  dir,
  shelleyGenesisPath: shelleyPath,
});

export default cardanocliJs;
