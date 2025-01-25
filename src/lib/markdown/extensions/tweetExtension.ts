import { Extension, Construct, Tokenizer, State } from "micromark-util-types";
import { codes } from "micromark-util-symbol";
import { ok as assert } from "devlop";
import { CgDesignmodo } from "react-icons/cg";

//TokenTypeを拡張
declare module 'micromark-util-types' {
    interface TokenTypeMap {
        tweetContainer: 'tweetContainer'//Tweet構文そのもの
        tweetContainerFence: 'tweetContainerFence'//開始記号":::tweet"
        tweetContainerFenceClose: 'tweetContainerFenceClose'//終了記号":::""
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

    //開始状態: ":"から開始
    const start: State = (code) => {
        assert(code === codes.colon, 'expected`:`');
        effects.enter("tweetContainer");
        effects.enter("tweetContainerFence");
        return openSequence(code);
    }

    let tweetCount = 0 //tweetの何文字目を探索しているか記録

    //開始記号を解析:(:::tweet)
    const openSequence: State = (code) => {
        //":::"を消費
        if (code === codes.colon) {
            effects.consume(code);
            return openSequence(code);
        }

        //'t'を読み取ったら"tweet"解析に進む
        if(code === codes.lowercaseT) {
            effects.consume(code);
            tweetCount++;
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
        //"weet"部分を消費
        if (
            (tweetCount === 1 && code === codes.lowercaseW) ||
            (tweetCount === 2 && code === codes.lowercaseE) ||
            (tweetCount === 3 && code === codes.lowercaseE) ||
            (tweetCount === 4 && code === codes.lowercaseT)
        ) {
            effects.consume(code);
            tweetCount++;
            return openText(code);
        }

        // "tweet の判定が完了し、空白または改行で開始フェンスを終了する"
        if (tweetCount === 5 && (code === codes.space || code === codes.lineFeed)) {
            effects.exit("tweetContainerFence");
            effects.enter("tweetContainerContent");
            return openContent(code);
        }

        return nok(code);//不正な構文は失敗
    } 
    
    let colonCount = 0;//終了フェンス':'の個数判定用

    //内容を解析する
    const openContent: State = (code) => {
        if (code === codes.colon) {
            colonCount++;

            //
            if(colonCount === 3){
                effects.exit("tweetContainerContent");
                effects.enter("tweetContainerFenceClose");
                return sequenceClose(code);
            }

            effects.consume(code);
            return openContent(code);
        }

        colonCount = 0;//コロン以外だったらリセット
        //TODO: ブロック構文の内部にあるその他構文も正しくトークン化されるようにする。
        effects.consume(code);
        return openContent(code);
    } 

    //終了記号解析:(:::)
    const sequenceClose: State = (code) => {
        if (code === codes.space || code ===codes.lineFeed || code === codes.eof) {
            effects.exit("tweetContainerFenceClose");
            effects.exit("tweetContainer");
            return ok(code);
        }

        return nok(code);
    }

    return start
}

const tweetContainer: Construct = {
    tokenize: tokenizeTweetContainer,
    concrete: true,
}