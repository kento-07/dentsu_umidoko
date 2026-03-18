document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            showSection(target);
        });
    });
});

function showSection(id) {
    // すべてのセクションを非表示にする
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // ターゲットのセクションを表示
    document.getElementById(id).classList.add('active');

    // ナビゲーションのactiveクラスを更新
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-target') === id) {
            link.classList.add('active');
        }
    });

    // ページトップへスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// キャンバスの解像度設定
canvas.width = 600;
canvas.height = 400;

let score = 0;
let gameActive = true;
let particles = []; // 花火用

const player = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 50,
    width: 80,
    height: 30,
    speed: 7,
    dx: 0
};

const beers = [];
const beerSpeed = 3;

// キーボード操作
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') player.dx = -player.speed;
    if (e.key === 'ArrowRight') player.dx = player.speed;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
});

function createBeer() {
    if (!gameActive) return;
    const x = Math.random() * (canvas.width - 30);
    beers.push({ x, y: 0, width: 25, height: 35 });
}

setInterval(createBeer, 1000);

function update() {
    if (!gameActive) return;

    // プレイヤー移動
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // ビール移動と衝突判定
    beers.forEach((beer, index) => {
        beer.y += beerSpeed;

        // キャッチ判定
        if (
            beer.y + beer.height > player.y &&
            beer.x < player.x + player.width &&
            beer.x + beer.width > player.x
        ) {
            beers.splice(index, 1);
            score += 1;
            checkWin();
        }

        // 逃した判定
        if (beer.y > canvas.height) {
            beers.splice(index, 1);
            score -= 2;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 海床 (簡易デザイン)
    ctx.fillStyle = "#d4af37"; // ゴールド
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.fillText("UMIDOKO", player.x + 10, player.y + 20);

    // ビール (簡易デザイン)
    beers.forEach(beer => {
        ctx.fillStyle = "#ffcc00"; // ビールの色
        ctx.fillRect(beer.x, beer.y, beer.width, beer.height);
        ctx.fillStyle = "#fff"; // 泡
        ctx.fillRect(beer.x, beer.y, beer.width, 10);
    });

    // スコア
    ctx.fillStyle = "#fff";
    ctx.font = "20px 'Montserrat'";
    ctx.textAlign = "right";
    ctx.fillText(`SCORE: ${score}pt`, canvas.width - 20, 40);

    if (gameActive) {
        update();
        requestAnimationFrame(draw);
    } else {
        drawFireworks();
    }
}

function checkWin() {
    if (score >= 5) {
        gameActive = false;
        createFireworks();
        setTimeout(() => {
            // クーポン画面へ遷移
            document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
            document.getElementById('coupon').style.display = 'block';
        }, 3000);
    }
}

// 花火エフェクト
function createFireworks() {
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            life: 1.0
        });
    }
}

function drawFireworks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
    });
    if (particles.length > 0) requestAnimationFrame(drawFireworks);
}

draw();

// グローバル変数としてクリアフラグを用意
let isCouponEarned = false;

function showSection(id) {
    // 1. すべてのセクションを非表示にする
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    // 2. ゲーム画面に遷移した時のリセット処理
    if (id === 'game') {
        resetGame(); // ゲームを最初からにする関数を呼ぶ
    } else {
        gameActive = false; // ゲーム画面以外ではカウントを止める
    }

    // 3. チケット画面に遷移した時のクーポン自動入力
    if (id === 'tickets' && isCouponEarned) {
        const couponInput = document.getElementById('coupon-code');
        if (couponInput) {
            couponInput.value = "FATHERS2026";
            couponInput.style.backgroundColor = "#fff9e6"; // 色を変えて気づかせやすく
            couponInput.style.borderColor = "#d4af37";
        }
    }

    // 4. 指定されたセクションを表示
    const targetSection = document.getElementById(id);
    if (targetSection) {
        targetSection.style.display = 'block';
        setTimeout(() => { targetSection.classList.add('active'); }, 10);
    }

    // ナビゲーション更新
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-target') === id) link.classList.add('active');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- ゲームリセット用の関数 ---
function resetGame() {
    score = 0;
    beers.length = 0; // 配列を空にする
    particles.length = 0;
    gameActive = true;
    player.x = canvas.width / 2 - 40; // 位置を中央に戻す
    
    // 再描画ループを開始（止まっていた場合）
    requestAnimationFrame(draw);
}

// --- checkWin関数をアップデート ---
function checkWin() {
    if (score >= 5) {
        gameActive = false;
        isCouponEarned = true; // クーポン獲得フラグを立てる
        createFireworks();
        setTimeout(() => {
            showSection('coupon'); // showSection経由で画面遷移
        }, 3000);
    }
}