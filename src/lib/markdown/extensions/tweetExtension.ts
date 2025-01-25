import { Extension, Construct, Tokenizer, State } from "micromark-util-types";
import { codes } from "micromark-util-symbol";
import { ok as assert } from "devlop";

//TokenTypeを拡張
declare module 'micromark-util-types' {
    interface TokenTypeMap {
        tweetContainer: 'tweetContainer'//Tweet構文そのもの
        tweetContainerFence: 'tweetContainerFence'//開始記号":::tweet"
        tweetContainerFenceClose: 'tweetConatinerFenceClose'//終了記号":::""
        tweetContainerContent: 'tweetContainerContent'//構文内の内容
    }
}

//micromarkの拡張を定義
export const tweetExtension = (): Extension => {
    return {
        flow: {
            [codes.colon]: tweetContainer,
        },
    }
}

//Tokenizer（トークン化を定義）
const tokenizeTweetContainer: Tokenizer = (effects, ok, nok) => {

    //':'で始まっているならばスタート
    const start: State = (code) => {
        assert(code === codes.colon, 'expected`:`');
        effects.enter("tweetContainer");
        effects.enter("tweetContainerFence");
        return openSequence(code);
    }

    let cnt = 0 //tweetの何文字目を探索しているか記録する変数

    //開始記号を読み取り・消費
    const openSequence: State = (code) => {
        //":::"を消費
        if (code === codes.colon) {
            effects.consume(code);
            return openSequence(code);
        }

        //'t'を読み取ったら次へ
        if(code === codes.lowercaseT) {
            effects.consume(code);
            cnt++;
            return openText(code);
        }

        //条件にそぐわない場合失敗
        return nok(code);
    }
    /*
    *2文字目が'w'
    *3文字目が'e'
    *4文字目が'e'
    *5文字目が't'
    *ならば、次に進む関数openText
    */
    const openText: State = (code) => {
        //"weet"部分を判定・消費
        if (
            (cnt === 1 && code === codes.lowercaseW) ||
            (cnt === 2 && code === codes.lowercaseE) ||
            (cnt === 3 && code === codes.lowercaseE) ||
            (cnt === 4 && code === codes.lowercaseT)
        ) {
            effects.consume(code);
            cnt++;
            return openText(code);
        }

        if (code === codes.eof || code === codes.space) {
            effects.exit("tweetContainerFence");
            effects.enter("tweetContainerContent");
            return openContent(code);
        }

        return nok(code);
    } 
    
    //内容をトークン化するopenContent
    const openContent: State = (code) => {
        if (code === codes.colon || code === codes.eof) {
            effects.exit("tweetContainerContent");
            effects.enter("tweetContainerFenceClose");

            effects.consume(code);
            return sequenceClose(code);
        }

        //TODO: ブロック構文の内部にあるその他構文も正しくトークン化されるようにする。
        effects.consume(code);
        return openContent(code);
    } 

    //終了記号":::"を判定・消費するsequenceClose
    const sequenceClose: State = (code) => {
        if (code === codes.colon) {
          effects.consume(code);
          return sequenceClose;
        }
        effects.exit("tweetContainerFenceClose");
        effects.exit("tweetContainer");
        return ok(code);
    }

    return start
}

const tweetContainer: Construct = {
    tokenize: tokenizeTweetContainer,
    concrete: true,
}