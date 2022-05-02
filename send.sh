#!/bin/bash

MAGIC="--mainnet"
FROM=$(cat ${PWD}/priv/wallet/ADAPI/ADAPI.payment.addr)
TO="addr1q89w9kpgsytcm9wag2nf28kuqgd3aq28fz6wzqzxhqvccv9vmdd9sz8mxfqx0vqderjejg22grwvgakn0ukhkudtflss48yy94"

mkdir -p transactions
ADDR="9bc599464803fc8f5c40c64d1fae844e64d59e7b5b0073dcdf76d16c3f66b374#0"
cardano-cli transaction build \
  --alonzo-era \
  --tx-in $ADDR \
  --tx-out "$TO+12000000 \
  +1744 b3e1cf0ef01fbcadba904194b9715cdfaa69578dd19208a5036c6bbe.42726f6e7a65204669727374205269646572 \
  +107 b3e1cf0ef01fbcadba904194b9715cdfaa69578dd19208a5036c6bbe.476f6c64204669727374205269646572 \
  +112 b3e1cf0ef01fbcadba904194b9715cdfaa69578dd19208a5036c6bbe.53696c766572204669727374205269646572 \
  +1 399f17dc58b027d22d2a2b6d52e3da69b62806c1e6ac0b7f474ee62f" \
  --change-address $TO \
  ${MAGIC} \
  --out-file  ${PWD}/transactions/init_w2.raw

# sign the transaction
cardano-cli transaction sign \
  ${MAGIC} \
  --signing-key-file  ${PWD}/priv/wallet/ADAPI/ADAPI.payment.skey \
  --tx-body-file  ${PWD}/transactions/init_w2.raw \
  --out-file  ${PWD}/transactions/init_w2.sign

# submit the transaction
cardano-cli transaction submit ${MAGIC} --tx-file  ${PWD}/transactions/init_w2.sign
