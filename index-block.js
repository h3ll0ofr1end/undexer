import * as Namada from '@fadroma/namada'
import getRPC from './connection.js'
import Block from "./models/Block.js";
import Transaction from "./models/Transaction.js";
import { WASM_TO_CONTENT } from './models/Contents/index.js';
import { NAME_TO_SECTION } from './models/Sections/index.js';
import { format } from "./utils.js";

const console = new Namada.Core.Console('Block')

const fetchText = url => {
  console.log(`Fetching ${url}`)
  return fetch(url).then(response=>response.text())
}

export default async function indexBlock (height) {

  // Get connection correspondinf to block height
  const { connection, query } = getRPC(height)

  // Fetch block data
  console.debug('Fetching block', height)
  const [ block, blockResponse, blockResultsResponse ] = await Promise.all([
    connection.getBlock(height),
    fetchText(`${connection.url}/block?height=${height}`),
    fetchText(`${connection.url}/block_results?height=${height}`),
  ])

  // Decode block data
  console.debug('Decoding block', height)
  const { id, txs } = connection.decode.block(blockResponse, blockResultsResponse)

  // Write block and all transactions to database.
  console.debug('Storing block', height, block.id)

  await Promise.all([

    // Block
    Block.create(block),

    // Each transaction in the block:
    ...txs.map(tx=>Promise.all([

      // The transaction
      Transaction.create({
        ...tx,
        id:   undefined,
        txId: tx.id
      }),

      // The transaction's content
      WASM_TO_CONTENT[tx.content.type].create(
        format(Object.assign(tx.content)).data
      ),

      // The transaction's sections
      ...tx.sections.map(section=>{
        const Section = NAME_TO_SECTION[section.type]
        if (!Section) {
          console.warn('Unknown section type', section.type)
          return false
        }
        return Section.create(section)
      }).filter(Boolean)

    ]))

  ])

}

