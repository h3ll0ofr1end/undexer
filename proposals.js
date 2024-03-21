import init, { Query } from "./shared/pkg/shared.js";
import { deserialize } from "borsh";
import { mkdirSync, readFileSync } from "node:fs";
import { save } from "./utils.js";
import { ProposalsSchema } from "./borsher-schema.js";

await init(readFileSync("shared/pkg/shared_bg.wasm"));
const q = new Query(
    process.env.UNDEXER_RPC_URL || "https://namada-testnet-rpc.itrocket.net"
);

if(process.env.UNDEXER_DATA_DIR){
    process.chdir(process.env.UNDEXER_DATA_DIR);
}
else{
    throw new Error('set UNDEXER_DATA_DIR');
}

try {
    await mkdirSync("governance");
} catch (ex) {
    console.log("Governance already exists");
}
process.chdir("governance");

const proposals = await q.query_proposals();
const propoDeserialized = deserialize(ProposalsSchema, proposals);

await save("proposals.json", propoDeserialized);