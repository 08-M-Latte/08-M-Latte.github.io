console.log("%c[I]%c " + `Liora テーマの基本スクリプト reload-fix.js が正常に読み込まれました!`, "background-color: #00896c;", "");

if (!reloadFlag) {
    console.warn("%c[W]%c " + `クリーンな実行環境: reloadFlag の値が false または未定義です。これは初回読み込みの可能性が高いです`, "background-color: #e98b2a;", "");

    // 初回読み込み時に、削除が必要なイベントリスナー一覧を定義
    window.reloadFix = {
        eventListeners: [{ elementPath: "element.pageHead", event: "click", handlerPath: "eventListener.pageHead.click" }],
    };
} else {
    // イベントリスナーを削除
    window.reloadFix.eventListeners.forEach(({ elementPath, event, handlerPath }) => {
        // パス文字列から安全にオブジェクト参照を取得する補助関数
        function getObjectByPath(path) {
            return path.split(".").reduce((obj, key) => obj?.[key], window);
        }

        const element = getObjectByPath(elementPath); // element 参照を動的に取得
        const eventHandler = getObjectByPath(handlerPath); // handler 参照を動的に取得

        if (!element) {
            console.warn("%c[W]%c " + `要素 ${elementPath} のイベントリスナーを削除しようとした際、要素オブジェクト ${elementPath} が空または未定義であることが判明したため、この（存在しない可能性のある）リスナーの削除をスキップします`, "background-color: #e98b2a;", "");
            return;
        }
        if (!eventHandler) {
            console.warn("%c[W]%c " + `要素 ${elementPath} のイベントリスナーを削除しようとした際、Handler オブジェクト ${handlerPath} が空または未定義であることが判明したため、この（存在しない可能性のある）リスナーの削除をスキップします`, "background-color: #e98b2a;", "");
            return;
        }
        element.removeEventListener(event, eventHandler);
        console.log("%c[I]%c " + `要素 ${elementPath} のイベントリスナー \`${event}, ${eventHandler}\` を削除しました`, "background-color: #00896c;", "");
    });
}

// フラグを残す
var reloadFlag = true;
console.log("%c[I]%c " + `reloadFlag = true`, "background-color: #00896c;", "");
