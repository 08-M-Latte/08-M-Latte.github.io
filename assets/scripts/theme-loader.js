/* global config */

var themePath;
var metaData;

// カラーテーマ切り替えローディングアニメーションの最短表示時間
const minimumColorSwitchTime = 650;
const colorSwitchSleepTime = 310;

class ThemeManager {
    constructor() {
        this.parse();
    }

    // テーマを解析
    parse() {
        // テーマディレクトリを構築
        themePath = window.location.href + "/assets/themes/" + config.content.theme.theme;
        console.log("%c[I]%c " + `Theme Path: ${themePath}`, "background-color: #00896c;", "");

        // XML を使ってテーマのメタデータを取得
        try {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", themePath + "/theme.json", false); // 同期リクエストを使用
            xhr.send();

            if (xhr.status >= 200 && xhr.status < 300) {
                metaData = JSON.parse(xhr.responseText);
            } else {
                throw new Error("テーマメタデータを取得できません");
            }
        } catch (error) {
            console.error("%c[E]%c " + `テーマメタデータの取得に失敗: ${error}`, "background-color: #cb1b45;", "");
            throw new Error("テーマメタデータの取得に失敗し、処理を続行できません");
        }

        console.log("%c[I]%c " + `テーマメタデータ: ${JSON.stringify(metaData)}`, "background-color: #00896c;", "");

        // メタデータの妥当性を確認
        if (metaData.id && metaData.name && metaData.version && metaData.files.styles && metaData.files.scripts && metaData.colors) {
            // ウェルカムメッセージを出力
            console.group("%cテーマ解析成功！%c" + `${metaData.name} (${metaData.id})`, "padding: 5px; border-radius: 6px 0 0 6px; background-color: #00896c; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #986db2; color: #ffffff;");
            console.log("%cID:%c" + `${metaData.id}`, "padding: 5px; border-radius: 6px 0 0 6px; background-color: #986db2; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #b5495b; color: #ffffff;");
            console.log("%cName:%c" + `${metaData.name}`, "padding: 5px; border-radius: 6px 0 0 6px; background-color: #986db2; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #b5495b; color: #ffffff;");
            console.log("%cVersion:%c" + `${metaData.version}`, "padding: 5px; border-radius: 6px 0 0 6px; background-color: #986db2; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #b5495b; color: #ffffff;");
            console.log("%cRepo:%c" + `${metaData.repo}`, "padding: 5px; border-radius: 6px 0 0 6px; background-color: #010101; color: #ffffff;", "padding: 5px; border-radius: 0 6px 6px 0; background-color: #ff9901; color: #ffffff;");
            console.groupEnd();

            return metaData;
        } else {
            console.error("%c[E]%c " + `テーマ解析に失敗し、メタデータに問題があります`, "background-color: #cb1b45;", "");
            throw new Error("テーマ解析に失敗し、処理を続行できません");
        }
    }

    // テーマを読み込む
    load() {
        // 生成された外部スタイルシートリンクの HTML を格納する配列を作成
        var styleLinks;

        // 基本スタイル URL を解析して配列に代入
        styleLinks = metaData.files.styles
            .map(key => {
                if (key) {
                    // <link> タグを作成
                    return `<link rel="stylesheet" href="${themePath}/styles/${key}" />`;
                }
                console.error("%c[E]%c " + `テーマ ${key} のスタイルタグ生成に失敗し、メタデータに問題がある可能性があります`, "background-color: #cb1b45;", "");
                throw new Error("テーマのスタイルタグ生成に失敗し、処理を続行できません");
            })
            .filter(Boolean); // 無効な値を除外

        // カラーテーマのスタイル URL を解析して配列に追加
        metaData.colors.index
            .map(key => {
                let targetColor = localStorage.getItem("theme.color"); // 対象カラーテーマの変数を保持

                // 対象カラーテーマが予約語「!autoSwitch」（自動切り替え）なら、実際に読み込むカラーテーマに置き換える
                if (targetColor === "!autoSwitch") {
                    console.log("%c[I]%c " + `現在のカラーテーマは !autoSwitch で自動切り替え中。ユーザーのブラウザのダークモード有効状態: ${window.matchMedia("(prefers-color-scheme: dark)").matches}`, "background-color: #00896c;", "");
                    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                        targetColor = config.content.theme.colors.autoSwitch.dark;
                    } else {
                        targetColor = config.content.theme.colors.autoSwitch.light;
                    }
                }

                const styles = metaData.colors.list[key].files.styles; // 対応する styles を取得

                // 対象のカラーテーマに応じて、タグの生成を決定
                if (styles && targetColor === key) {
                    // styles が配列なら、複数の link タグを生成
                    return styles.map(file => `<link rel="stylesheet" href="${themePath}/colors/${key}/styles/${file}" />`).join(""); // 生成された全 link タグを結合
                } else if (localStorage.getItem("theme.color") !== key) {
                    console.log("%c[I]%c " + `生成をスキップした ${key} カラーテーマのスタイルタグは、key の値がユーザー設定と一致しないためです`, "background-color: #00896c;", "");
                    return;
                }
                console.error("%c[E]%c " + `カラーテーマ ${key} のスタイルタグ生成に失敗し、メタデータに問題がある可能性があります`, "background-color: #cb1b45;", "");
                throw new Error("カラーテーマのスタイルタグ生成に失敗し、処理を続行できません");
            })
            .filter(Boolean) // 無効な値を除外
            .forEach(linkTags => {
                styleLinks.push(linkTags); // 生成した link タグを配列に追加
            });

        console.log("%c[I]%c " + `挿入予定の Style 外部リンク: ${styleLinks}`, "background-color: #00896c;", "");

        // 生成された Script 外部リンク HTML を格納する配列を作成
        var scriptLinks;

        // 基本スクリプト URL を解析して配列へ代入
        scriptLinks = metaData.files.scripts
            .map(key => {
                if (key) {
                    // <script> タグを作成
                    return `<script src="${themePath}/scripts/${key}"></script>`;
                }
                console.error("%c[E]%c " + `テーマ ${key} のスクリプトタグ生成に失敗し、メタデータに問題がある可能性があります`, "background-color: #cb1b45;", "");
                throw new Error("テーマスクリプトのタグ生成に失敗し、処理を続行できません");
            })
            .filter(Boolean); // 無効な値を除外

        // カラーテーマのスクリプト URL を解析して配列に追加
        metaData.colors.index
            .map(key => {
                let targetColor = localStorage.getItem("theme.color"); // 対象カラーテーマの変数を保持

                // 対象カラーテーマが予約語「!autoSwitch」（自動切り替え）なら、実際に読み込むカラーテーマに置き換える
                if (targetColor === "!autoSwitch") {
                    console.log("%c[I]%c " + `現在のカラーテーマは !autoSwitch で自動切り替え中。ユーザーのブラウザのダークモード有効状態: ${window.matchMedia("(prefers-color-scheme: dark)").matches}`, "background-color: #00896c;", "");
                    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                        targetColor = config.content.theme.colors.autoSwitch.dark;
                    } else {
                        targetColor = config.content.theme.colors.autoSwitch.light;
                    }
                }

                const scripts = metaData.colors.list[key].files.scripts; // 対応する scripts を取得

                // 対象のカラーテーマに応じて、タグの生成を決定
                if (scripts && targetColor === key) {
                    // scripts が配列なら、複数の script タグを生成
                    return scripts.map(file => `<script src="${themePath}/colors/${key}/scripts/${file}"></script>`).join(""); // 生成された全 link タグを結合
                } else if (localStorage.getItem("theme.color") !== key) {
                    console.log("%c[I]%c " + `生成をスキップした ${key} カラーテーマのスクリプトタグは、key の値がユーザー設定と一致しないためです`, "background-color: #00896c;", "");
                    return;
                }
                console.error("%c[E]%c " + `カラーテーマ ${key} のスクリプトタグ生成に失敗し、メタデータに問題がある可能性があります`, "background-color: #cb1b45;", "");
                throw new Error("カラーテーマスクリプトのタグ生成に失敗し、処理を続行できません");
            })
            .filter(Boolean) // 無効な値を除外
            .forEach(linkTags => {
                scriptLinks.push(linkTags); // 生成した link タグを配列に追加
            });

        console.log("%c[I]%c " + `挿入予定の Script 外部リンク: ${scriptLinks}`, "background-color: #00896c;", "");

        // styleLinks と scriptLinks を結合
        const resTag = [...styleLinks, ...scriptLinks];

        // 生成された外部リンクを theme 要素に挿入
        document.querySelector("theme").innerHTML = resTag.join("");

        console.log("%c[I]%c " + ` <theme> 内の全 Script を実行する準備中`, "background-color: #00896c;", "");

        // <theme> 内の全 Script を実行
        this.runScripts();
    }

    // カラーテーマを設定
    setColor(colorId) {
        if (colorId === localStorage.getItem("theme.color")) {
            console.warn("%c[W]%c " + `現在のカラーテーマはすでに ${colorId} です。無駄に再読込するより、今すぐ変更を中断したほうがよさそうです`, "background-color: #e98b2a;", "");
        } else {
            // スクロールバーを非表示
            document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`; // body にスクロールバー幅と同じ右側の余白を追加し、ページの揺れを防ぐ
            document.body.style.overflow = "hidden";

            // 読み込みアニメーションの再生を開始
            document.getElementById("theme-color-loader-iframe").className = "start"; // 再生開始アニメーション

            // カラーテーマを読み込む
            setTimeout(() => {
                // インデックスにカラーテーマが存在するか確認
                // 予約語 !autoSwitch はインデックスに含めなくてよい
                if (metaData.colors.index.includes(colorId) || colorId === "!autoSwitch") {
                    try {
                        localStorage.setItem("theme.color", colorId);

                        // テーマを再読み込み
                        themeManager.load();

                        console.log("%c[I]%c " + `カラーテーマを ${colorId} に変更しました`, "background-color: #00896c;", "");
                    } catch (error) {
                        console.error("%c[E]%c " + `カラーテーマを ${colorId} に変更できません: ${error}`, "background-color: #cb1b45;", "");
                        throw new Error("カラーテーマの変更に失敗: ", error);
                    }
                } else {
                    console.error("%c[E]%c " + `カラーテーマを ${colorId} に変更できません。テーマのカラーテーマインデックスに一致する値が見つかりませんでした`, "background-color: #cb1b45;", "");
                    throw new Error("カラーテーマの変更に失敗し、テーマのカラーテーマインデックスに一致する値がありません");
                }

                // カラーテーマ設定の選択効果を読み込む
                loadThemeSelEff();
            }, colorSwitchSleepTime);

            // 読み込みアニメーションの再生を終了
            (() => {
                setTimeout(() => {
                    document.getElementById("theme-color-loader-iframe").className = "end"; // 終了アニメーションを再生
                    document.body.style.paddingRight = "unset"; // body の右余白を戻す
                    document.body.style.overflow = "unset"; // スクロールバーを再表示
                }, minimumColorSwitchTime);
            })();
        }
    }

    runScripts() {
        // <theme> 内の全 <script> タグを走査
        document.querySelectorAll("theme > script").forEach(script => {
            // 現在の script タグの src を取得
            const src = script.src;

            // src が存在する場合（外部リンクであることを確認）
            if (src) {
                // 元の script タグを削除
                script.remove();

                // 新しい script タグを作成して再挿入
                const newScript = document.createElement("script");
                newScript.src = src;
                document.head.appendChild(newScript);
            }
        });
    }
}

// カラーテーマ選択効果を読み込む
function loadThemeSelEff() {
    // 既に読み込まれている選択効果があれば削除
    if (document.querySelector(".theme-item.enable")) {
        document.querySelector(".theme-item.enable").setAttribute("class", "theme-item");
    }

    // 新しい選択効果クラスを挿入
    document.getElementById(`theme-item-${localStorage.getItem("theme.color")}`).setAttribute("class", "theme-item enable");
}

// ThemeManager インスタンスを作成
const themeManager = new ThemeManager();

document.addEventListener("DOMContentLoaded", () => {
    // 初回アクセス時は、カラーテーマをデフォルト値に設定
    if (localStorage.getItem("theme.color") === null) {
        themeManager.setColor(config.content.theme.colors.default);
    } else {
        // それ以外は通常通りテーマを読み込む
        themeManager.load();
    }

    /* 利用可能なカラーテーマから設定ボタンを生成 */

    // .themes 要素を取得
    const themesElement = document.querySelector(".primary-container > .left-area > .cards > .card-item > .content > .settings-item > .themes");

    // ボタン HTML を格納する配列を作成
    const themeButtons = config.content.theme.colors.enable
        .map(key => {
            let displayName;
            let icon;
            let color;
            let background;

            if (key === "!autoSwitch") {
                console.log("%c[I]%c " + `Website config enabled !autoSwitch`, "background-color: #00896c;", "");

                displayName = config.content.theme.colors.autoSwitch.displayName; // 対応する displayName を取得
                icon = config.content.theme.colors.autoSwitch.icon.icon; // 対応する icon を取得
                color = config.content.theme.colors.autoSwitch.icon.color; // 対応する color を取得
                background = config.content.theme.colors.autoSwitch.icon.background; // 対応する background を取得
            } else {
                displayName = metaData.colors.list[key].displayName; // 対応する displayName を取得
                icon = metaData.colors.list[key].icon.icon; // 対応する icon を取得
                color = metaData.colors.list[key].icon.color; // 対応する color を取得
                background = metaData.colors.list[key].icon.background; // 対応する background を取得
            }

            if (displayName && icon && color && background) {
                // <div> タグを作成
                return `
                <div class="theme-item" id="theme-item-${key}" style="color: ${color}; background: ${background};" @click="themeManager.setColor(\`${key}\`);">
                    <i class="${icon}"></i>
                    <span>${displayName}</span>
                </div>
            `;
            } else {
                console.error("%c[E]%c " + `カラーテーマ ${key} の設定ボタン生成に失敗しました。テーマメタデータのカラーテーマ情報 (${displayName}, ${icon}, ${color}, ${background}) が条件を満たしておらず、メタデータに問題がある可能性があります`, "background-color: #cb1b45;", "");
            }
            return "";
        })
        .filter(Boolean); // 無効な値を除外

    // 生成したボタンを .social-icons に挿入
    themesElement.innerHTML = themeButtons.join("");

    // カラーテーマ設定の選択効果を読み込む
    loadThemeSelEff();

    /* 利用可能なカラーテーマから設定ボタンを生成 End */
});
