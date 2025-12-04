import sha256 from 'crypto-js/sha256'
import encHex from 'crypto-js/enc-hex';

export function encryptoPassword(password) {
    console.log("pass",password);
    const haash = sha256(password);
    console.log("hex",haash.toString(encHex))
    const generatedSeed = haash.toString(encHex).substring(0, 32);
    return generatedSeed;
    // console.log("generatedSeed",generatedSeed)
    // return sha256(generatedSeed).toString(encHex).substring(0, 32);
}