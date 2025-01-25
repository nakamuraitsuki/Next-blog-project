import { codes } from "micromark-util-symbol";
import { Tokenizer, State, TokenizeContext } from "micromark-util-types";
import { attention, blockQuote, autolink } from "micromark-core-commonmark";

/*
*インライン構文を処理するトークナイザー
*アロー関数だとthisが上手く参照できないのでfunctionで唱えている
*/
export const inlineTokenizer: Tokenizer = function(effects, ok, nok)  {
    const self: TokenizeContext = this;

    let state: State = (code) => {

        //*から始まる強調
        if (code === codes.asterisk) {
            return attention.tokenize.call(this, effects, ok, nok);
        }

        // リストまたはブロック引用の開始処理（例: ">"）
        if (code === codes.greaterThan) {
            return blockQuote.tokenize.call(this, effects, ok, nok);
        }

        // 自動リンク処理
        if (code === codes.lessThan) {
            return autolink.tokenize.call(this, effects, ok, nok);
        }
    }

    return state
}