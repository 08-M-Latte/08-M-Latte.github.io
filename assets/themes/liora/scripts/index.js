console.log("%c[I]%c " + `Liora テーマの基本スクリプト index.js が正常に読み込まれました!`, "background-color: #00896c;", "");

var flag = autoInitObject();
var eventListener = autoInitObject();

// DOM 要素を取得
var element = {
    pageHead: document.querySelector(".page-head"),
};

// ヘッダークリック時の展開効果
flag.pageHead.click = true;
eventListener.pageHead.click = () => {
    if (flag.pageHead.click) {
        element.pageHead.classList.add("expand");
    } else {
        element.pageHead.classList.remove("expand");
    }

    flag.pageHead.click = !flag.pageHead.click;
}
element.pageHead.addEventListener("click", eventListener.pageHead.click);
