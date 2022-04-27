import cardano from "./cardano";

const sender = cardano.wallet("ADAPI");

console.log(sender.name);
console.log(sender.paymentAddr);
console.log(sender.balance());
