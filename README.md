# Creating tokens on the Cardano blockchain using JavaScript

## Prerequisites

- cardano-node / cardano-cli set up on local machine (https://docs.cardano.org/projects/cardano-node/en/latest) and the node is running
- node.js installed

## Usage

- Install the dependencies
```bash
npm install
```

- Run the node and verify the `CARDANO_NODE_SOCKET_PATH` env variable

- Download the Genesis config file needed for shelly-era

```bash
sh fetch-config.sh
```

- Create a wallet

```bash
node src/create-wallet.js
```

- Check the balance (it should be zero)

```bash
node src/get-balance.js
```

- Populate assets.json 

- Add some funds to the wallet (you can use [testnet faucet](https://developers.cardano.org/docs/integrate-cardano/testnet-faucet/))

- Create the minting transaction

```bash
node src/mint-asset.js
```

- Check the balance once more
