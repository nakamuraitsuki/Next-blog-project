import { Extension, Construct, Tokenizer, State } from "micromark-util-types";
import { codes } from "micromark-util-symbol";

//TokenTypeを拡張
declare module 'micromark-util-types' {
    interface TokenTypeMap {
        tweetContainer: 'tweetContainer'//Tweet構文そのもの
        tweetContainerFence: 'tweetContainerFence'//開始記号":::tweet"
        tweetContainerFenceClose: 'tweetContainerFenceClose'//終了記号":::""
        tweetContainerContent: 'tweetContainerContent'//構文内の内容
    }
}
//TODO: 内容に\nや::が含まれてしまう
//Tokenizer（トークン化を定義）
const  tokenizeTweetContainer: Tokenizer = function(effects, ok, nok) {
    console.log("--------tokenize start--------")

    //開始状態: ":"から開始
    const start: State = (code) => {
        console.log(code);
        if (code !== codes.colon) {
            return nok(code);
        }

        effects.enter("tweetContainer");
        console.log("enter tweetContainer");
        effects.enter("tweetContainerFence");
        console.log("enter tweetContainerFenec");
        return openSequence(code);
    }

    let startColonCount = 0;
    let tweetCount = 0 //tweetの何文字目を探索しているか記録

    //開始記号を解析:(:::tweet)
    const openSequence: State = (code) => {
        console.log(code);
        //":::"を消費
        if (code === codes.colon && startColonCount !== 3) {
            effects.consume(code);
            startColonCount++;
            return openSequence;
        }

        //'t'を読み取ったら"tweet"解析に進む
        if(startColonCount === 3 && code === codes.lowercaseT) {
            return openText(code);
        }

        //条件にそぐわない場合失敗
        console.log("tokenize faile (openSequence)");
        effects.exit("tweetContainerFence");
        effects.exit("tweetContainer");
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
        console.log(code);
        //"weet"部分を消費
        if (
            (tweetCount === 0 && code === codes.lowercaseT) ||
            (tweetCount === 1 && code === codes.lowercaseW) ||
            (tweetCount === 2 && code === codes.lowercaseE) ||
            (tweetCount === 3 && code === codes.lowercaseE) ||
            (tweetCount === 4 && code === codes.lowercaseT)
        ) {
            effects.consume(code);
            tweetCount++;
            return openText;
        }

        // "tweet の判定が完了し、空白または改行で開始フェンスを終了する"
        if (tweetCount === 5 && (code === codes.space || code === codes.lineFeed)) {
            effects.exit("tweetContainerFence");
            console.log("exit tweetContainerFence");
            effects.enter("tweetContainerContent");
            console.log("enter tweetContainerContent");
            return openContent(code);
        }

        console.log("tokenize faile (openText)");
        effects.exit("tweetContainerFence");
        effects.exit("tweetContainer");
        return nok(code);//不正な構文は失敗
    } 

    //内容を解析する
    let isInital = true;
    const openContent: State = (code) => {
        console.log(code);
        if (isInital){
            isInital = false;
            effects.consume(code);
            return openContent;
        }
        //"\n"で内容終了
        if (code === codes.lineFeed) {
            effects.exit("tweetContainerContent");
            console.log("exit tweetContainrContent");
            effects.enter("tweetContainerFenceClose");
            console.log("enter tweetContainrFenceClose");
            return sequenceClose(code);
        }

        effects.consume(code);
        return openContent;
    } 
    
    let endColonCount = 0;//終了フェンス':'の個数判定用
    //終了記号解析:(:::)
    const sequenceClose: State = (code) => {
        console.log(code);
        if (code === codes.lineFeed && endColonCount === 0) {
            effects.consume(code);
            endColonCount++;
            return sequenceClose;
        }

        if (code === codes.colon && endColonCount !== 3) {
            effects.consume(code);
            return sequenceClose;
        }

        if ((code === codes.space || code ===codes.lineFeed || code === codes.eof || code === null)) {
            effects.exit("tweetContainerFenceClose");
            console.log("exit tweetContainerFenceClose");
            effects.exit("tweetContainer");
            console.log("exit tweetContainer");
            return ok(code);
        }
        console.log("tokenize faile (sequenceClose)")
        effects.exit("tweetContainerFenceClose");
        effects.exit("tweetContainer");
        return nok(code);
    }

    return start
}

//拡張で呼び出されるConstruct
const tweetContainer: Construct = {
    tokenize: tokenizeTweetContainer,
    concrete: true,
}

//micromarkの拡張を定義
export const tweetExtension = (): Extension => {
    //console.log("micromark extension");
    return {
        flow: {
            [codes.colon]: tweetContainer,
        },
    }
}