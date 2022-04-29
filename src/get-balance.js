import cardano from "./cardano.js";

const sender = cardano.wallet("ADAPI");

console.log(sender.name);
console.log(sender.paymentAddr);
console.log(sender.balance());
