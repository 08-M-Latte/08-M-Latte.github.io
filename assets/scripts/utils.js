/* global swal, markdownit */

// サイト設定を取得
function getWebsiteConfig() {
    return {
        content: {},
        init() {
            try {
                const xhr = new XMLHttpRequest();
                // 時間戳を付けて条件付きリクエストにし、更新があれば即座に反映する
                xhr.open("GET", "./config.json?_t=" + Date.now(), false); // 同期リクエストを使用
                xhr.send();

                if (xhr.status >= 200 && xhr.status < 300) {
                    this.content = JSON.parse(xhr.responseText); // config オブジェクトを動的に更新
                } else {
                    throw new Error("サイト設定ファイルを取得できません");
                }
            } catch (error) {
                console.error("サイト設定ファイルを取得できません: ", error);
            }
        },
    };
}

// サイト設定を取得
const config = getWebsiteConfig();
config.init();

// オブジェクトの再帰的初期化プロキシ
function autoInitObject() {
    return new Proxy(
        {},
        {
            get(target, prop) {
                // プロパティが存在しない場合、再帰的に新しいプロキシを返す
                if (!(prop in target)) {
                    target[prop] = autoInitObject();
                }
                return target[prop];
            },
            set(target, prop, value) {
                // 通常どおり設定
                target[prop] = value;
                return true;
            },
        }
    );
}

// スロットル関数
// NOTE: スロットルの役割は、イベント発火頻度がどれだけ高くても、指定した時間間隔ごとに関数が1回だけ実行されるようにすることです。
function throttle(func, interval) {
    let lastTime = 0;
    return function (...args) {
        const now = Date.now(); // 現在時刻
        if (now - lastTime >= interval) {
            func.apply(this, args); // 前回実行時刻から間隔を超えていれば関数を実行
            lastTime = now; // 前回実行時刻を更新
        }
    };
}

// デバウンス関数
// NOTE: デバウンスの役割は、イベント発火後に delay 以内に再発火がなければ、対象の関数を実行することです。
function debounce(func, delay) {
    let timer;
    return function (...args) {
        const context = this;
        clearTimeout(timer); // イベント発火ごとに前のタイマーを削除
        timer = setTimeout(() => {
            func.apply(context, args); // タイマーを再設定して関数を呼び出す
        }, delay);
    };
}

// markdown-it インスタンスを初期化
const md = new markdownit({
    html: true, // HTML タグを許可
});

// Markdown レンダラー
function renderMarkdown() {
    // ページ内の全 .markdown-content 要素を取得
    const markdownElements = document.querySelectorAll(".markdown-content");

    // 各要素を走査し、src に指定された Markdown ファイルを取得してレンダリングする
    markdownElements.forEach(element => {
        const rawSrc = element.getAttribute("src"); // src 属性を取得

        if (rawSrc) {
            const src = new URL(rawSrc, document.baseURI);

            // キャッシュを使いつつ条件付きリクエストで取得し、更新があれば即座に反映する
            fetch(src.href, { cache: "no-cache" })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Markdown ファイルを取得できません: ${src.href}`);
                    }
                    return response.text();
                })
                .then(markdownContent => {
                    // markdown-it で Markdown を HTML に変換
                    const renderedHTML = md.render(markdownContent);

                    // レンダリング済みの HTML で元の内容を置き換える
                    element.innerHTML = renderedHTML;
                })
                .catch(error => {
                    console.error(error);
                    element.innerHTML = `<span style='color: red;'>Markdown ファイルの読み込みに失敗しました: ${rawSrc}</span>`;
                });
        } else {
            element.innerHTML = "<span style='color: red;'>Markdown ファイルの読み込みに失敗しました: src 属性にファイルパスが指定されていません</span>";
        }
    });
}

// メソッドを window グローバルオブジェクトへマウント
window.autoInitObject = autoInitObject;
