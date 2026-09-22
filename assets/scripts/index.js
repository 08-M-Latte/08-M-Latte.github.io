/* global config, throttle, debounce, Alpine, getWebsiteConfig, Typed, swal, renderMarkdown */

// Alpine を初期化
document.addEventListener("alpine:init", () => {
    Alpine.data("getWebsiteConfig", config);
});

document.addEventListener("DOMContentLoaded", async () => {
    // DOM 要素を取得
    var element = {
        pageHead: document.querySelector(".page-head"),
        leftArea: document.querySelector(".primary-container > .left-area"),
        socialIcons: document.querySelector(".social-icons"),
        icpInfo: document.querySelector(".icp-info"),
        webmasterInfo: document.querySelector(".webmaster-info"),
    };

    // 画面幅を確認してフラグを設定
    var mobileMode = false;
    if (window.matchMedia("(max-width: 899px)").matches) {
        mobileMode = true;
        console.log("%c[I]%c " + `mobileMode: true`, "background-color: #00896c;", "");
    }

    // サイトタイトルを設定
    document.title = config.content.title;

    // コンソールへ歓迎メッセージを出力
    console.log("%c欢迎来到%c" + config.content.title + "！", "padding: 5px; border-radius: 6px 0 0 6px; background-color: #1e88a8; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #b5495b; color: #ffffff;");
    console.group("%c打开开发者工具是想干嘛呢？应该是想扒代码吧！项目是开源的哦 (GPL-v3)，你喜欢的话拿去用就是了！%c" + "o(〃'▽'〃)o", "padding: 5px; border-radius: 6px 0 0 6px; background-color: #00896c; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #986db2; color: #ffffff;");
    console.log("%c注意！此页面内的某些由站长添加的内容可能并不是开源的，直接从本站 CV 代码前最好先问问站长哦~", "padding: 5px; border-radius: 6px 6px 6px 6px; background-color: #b5393b; color: #ffffff;");
    console.log("%cGitHub.com/%c" + "ChengCheng0v0/ACG-Home", "padding: 5px; border-radius: 6px 0 0 6px; background-color: #010101; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #ff9901; color: #ffffff;");
    console.groupEnd();

    // Markdown コンテンツをレンダリング
    renderMarkdown();

    // ヘッダーの打ち込みタイトルを読み込む（Typed.js が読み込めなかった場合は静的タイトルにフォールバック）
    const pageTitleElement = document.querySelector(".page-head > .title");
    if (window.Typed && pageTitleElement) {
        new Typed(".page-head > .title", {
            strings: config.content.pageHead.typedContent,
            startDelay: 300,
            backDelay: 1000,
            typeSpeed: 100,
            backSpeed: 50,
            showCursor: true,
            loop: true,
        });
    } else if (pageTitleElement) {
        pageTitleElement.textContent = config.content.pageHead.typedContent[0] || "Loading...";
    }

    /* SNS リンクアイコンを生成 */

    // リンク HTML を格納する配列を作成
    const socialIconLinks = config.content.masterInfo.socialLink.enable
        .map(key => {
            const icon = config.content.masterInfo.socialLink.icon[key]; // 対応する icon を取得
            const link = config.content.masterInfo.socialLink.link[key]; // 対応する link を取得
            if (icon && link) {
                // <a> タグを作成
                return `<a href="${link}" target="_blank"><i class="${icon}"></i></a>`;
            }
            return "";
        })
        .filter(Boolean); // 無効な値を除外

    // 生成したリンクを .social-icons 要素に挿入
    element.socialIcons.innerHTML = socialIconLinks.join("");

    /* SNS リンクアイコン生成 End */

    // サイト内の固定名言。外部 API やブラウザ拡張の遮断によるページ読み込み異常を防ぐ
    const hitokoto = document.querySelector("#hitokoto-text");
    if (hitokoto) {
        hitokoto.href = "https://ja.wikipedia.org/wiki/%E6%9C%AB%E3%81%9D%E3%81%9E%E5%B7%B1%E3%81%9E%E6%BD%9C%E3%81%8F";
    }

    // モバイル端末以外では左側エリアを自動的に浮かせる
    if (!mobileMode) {
        const pageHeadHeight = element.pageHead.clientHeight;
        const updateFloatPageHeadMargin = debounce(() => {
            element.leftArea.style.marginTop = window.scrollY - pageHeadHeight + "px";
        }, 60);
        document.addEventListener("scroll", () => {
            if (window.scrollY >= pageHeadHeight) {
                updateFloatPageHeadMargin();
            } else {
                element.leftArea.style.marginTop = "unset";
            }
        });
    }

    /* フッターの ICP 情報を生成 */

    // リンク HTML を格納する配列を作成
    const icpInfoLinks = config.content.icp.enable
        .map(key => {
            const code = config.content.icp.info.code[key]; // 対応する code を取得
            const link = config.content.icp.info.link[key]; // 対応する link を取得
            if (code && link) {
                // <a> タグを作成
                return `<a class="icp-link" href="${link}" target="_blank">${code}</a>`;
            }
            return "";
        })
        .filter(Boolean); // 無効な値を除外

    // 生成したリンクを fa-shield アイコンでつなぎ、.icp-info 要素に挿入
    element.icpInfo.innerHTML = icpInfoLinks.join(` <i class="fa-solid fa-shield"></i> `);

    /* フッターの ICP 情報生成 End */

    /* フッターの重複著作者名を検出して修正 */ // (あまり効果がないようだ

    // ここだけは変更しないでほしい… (＞﹏＜)
    if (config.content.masterInfo.name === "成成0v0") {
        element.webmasterInfo.innerHTML = "";
    }

    /* フッターの重複著作者名の検出と修正 End */
});
