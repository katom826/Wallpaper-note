const canvas = document.getElementById('export-canvas');
const ctx = canvas.getContext('2d');
const memoInput = document.getElementById('memo-input');
const downloadBtn = document.getElementById('download-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const modalCancel = document.getElementById('modal-cancel');
const modalSave = document.getElementById('modal-save');
const resWidthInput = document.getElementById('res-width');
const resHeightInput = document.getElementById('res-height');

// デフォルト設定
const DEFAULT_WIDTH = 1170;
const DEFAULT_HEIGHT = 2532;

// 設定 (ローカルストレージから読み込み)
const CONFIG = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    bgColor: '#a63d3d',
    textColor: '#ffffff',
    fontSize: 100,
    lineHeight: 1.4,
    padding: 100,
    fontFamily: "'Outfit', 'Noto Sans JP', sans-serif"
};

/**
 * ローカルストレージから解像度設定を読み込む
 */
function loadSettings() {
    const saved = localStorage.getItem('wallpaper-resolution');
    if (saved) {
        try {
            const { width, height } = JSON.parse(saved);
            CONFIG.width = width;
            CONFIG.height = height;
        } catch (e) {
            // 壊れたデータは無視
        }
    }
    // Canvas のサイズを更新
    canvas.width = CONFIG.width;
    canvas.height = CONFIG.height;
    // フォントサイズを解像度に応じて自動調整
    CONFIG.fontSize = Math.round(CONFIG.width * 0.085);
    CONFIG.padding = Math.round(CONFIG.width * 0.085);
    // フォーム値を同期
    resWidthInput.value = CONFIG.width;
    resHeightInput.value = CONFIG.height;
}

/**
 * 解像度設定をローカルストレージに保存する
 */
function saveSettings(width, height) {
    CONFIG.width = width;
    CONFIG.height = height;
    canvas.width = width;
    canvas.height = height;
    CONFIG.fontSize = Math.round(width * 0.085);
    CONFIG.padding = Math.round(width * 0.085);
    localStorage.setItem('wallpaper-resolution', JSON.stringify({ width, height }));
}

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
        const characters = Array.from(paragraph); // サロゲートペア対応

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
    draw();

    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const preview = memoInput.innerText.slice(0, 5).trim() || 'memo';
    
    link.download = `Wallpaper_${CONFIG.width}x${CONFIG.height}_${dateStr}_${preview}.png`;
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
        window.scrollTo(0, 0);
    }
}

// iOS特有の画面持ち上がり（スクロール）を防止
window.addEventListener('scroll', () => {
    if (document.activeElement === memoInput) {
        window.scrollTo(0, 0);
    }
});

// --- モーダル操作 ---
function openModal() {
    resWidthInput.value = CONFIG.width;
    resHeightInput.value = CONFIG.height;
    settingsModal.hidden = false;
}

function closeModal() {
    settingsModal.hidden = true;
}

function handleSave() {
    const w = parseInt(resWidthInput.value, 10);
    const h = parseInt(resHeightInput.value, 10);
    if (w >= 100 && w <= 9999 && h >= 100 && h <= 9999) {
        saveSettings(w, h);
        draw();
        closeModal();
    }
}

// --- イベントリスナー ---
memoInput.addEventListener('input', draw);
downloadBtn.addEventListener('click', downloadImage);
settingsBtn.addEventListener('click', openModal);
modalCancel.addEventListener('click', closeModal);
modalSave.addEventListener('click', handleSave);

// オーバーレイクリックで閉じる
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeModal();
});

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', adjustHeight);
}

// 初期化
window.onload = () => {
    loadSettings();
    draw();
    adjustHeight();

    // 初回アクセス時は解像度設定モーダルを表示
    if (!localStorage.getItem('wallpaper-resolution')) {
        openModal();
    } else {
        memoInput.focus();
    }
};
