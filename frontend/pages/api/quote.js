import {quoteClient} from "./client";

/**
 * @param {string} stockSymbol
 * @param {string} userId
 * @returns {Promise<{ 'quote'?: (number | string);'sym'?: (string);'userId'?: (string);'timestamp'?: (number | string | Long);'cryptoKey'?: (string); }>}
 */
export default function quote(stockSymbol, userId) {
    return new Promise((accept, reject) => {
        new quoteClient.Quote({stockSymbol, userId}, (err, value) => {
            if (err != null) {
                accept(value)
            } else {
                reject(err)
            }
        })
    })
}