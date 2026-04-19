const canvas = document.getElementById('export-canvas');
const ctx = canvas.getContext('2d');
const memoInput = document.getElementById('memo-input');
const downloadBtn = document.getElementById('download-btn');

// 設定
const CONFIG = {
    width: 1170,
    height: 2532,
    bgColor: '#a63d3d',
    textColor: '#ffffff',
    fontSize: 100, // 高解像度用のベースサイズ
    lineHeight: 1.4,
    padding: 100,
    fontFamily: "'Outfit', 'Noto Sans JP', sans-serif"
};

/**
 * キャンバスを描画
 */
function draw() {
    const text = memoInput.innerText;

    // 背景塗りつぶし
    ctx.fillStyle = CONFIG.bgColor;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    if (!text) return;

    // フォント設定
    ctx.fillStyle = CONFIG.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${CONFIG.fontSize}px ${CONFIG.fontFamily}`;

    // テキストの折り返し処理
    const words = text.split('\n');
    const lines = [];
    const maxWidth = CONFIG.width - CONFIG.padding * 2;

    words.forEach(paragraph => {
        let currentLine = '';
        const characters = Array.from(paragraph); // サロゲートペア対応のためArray.fromを使用

        characters.forEach(char => {
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine);
    });

    // 全体の高さを計算して中央寄せ
    const totalHeight = lines.length * CONFIG.fontSize * CONFIG.lineHeight;
    let startY = (CONFIG.height / 2) - (totalHeight / 2) + (CONFIG.fontSize / 2);

    lines.forEach((line, index) => {
        ctx.fillText(line, CONFIG.width / 2, startY + (index * CONFIG.fontSize * CONFIG.lineHeight));
    });
}

/**
 * 画像として保存
 */
function downloadImage() {
    // 描画を強制実行
    draw();

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    
    // ファイル名を生成 (日付_メモの冒頭)
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const preview = memoInput.innerText.slice(0, 5).trim() || 'memo';
    
    link.download = `iPhone14_Wallpaper_${dateStr}_${preview}.png`;
    link.href = dataURL;
    link.click();
}

/**
 * キーボード表示時の高さを補正 (iPhone対策)
 */
function adjustHeight() {
    if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        document.body.style.height = `${viewportHeight}px`;
        document.getElementById('app').style.height = `${viewportHeight}px`;
    }
}

// イベントリスナー
memoInput.addEventListener('input', draw);
downloadBtn.addEventListener('click', downloadImage);

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', adjustHeight);
}

// 初期描画
window.onload = () => {
    draw();
    adjustHeight();
    // モバイルでキーボードを即座に出すための試み
    memoInput.focus();
};
