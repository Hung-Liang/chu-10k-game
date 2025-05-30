// Matter.js 模組
const { Engine, Render, World, Bodies, Runner, Composite, Body, Events } = Matter;

let subscribers = 1;
let gold = 0;
let incomePerSubscriber = 0.1;
let goldPerSecond = 0;
let goldPerClick = 0.1;
let newSubscribersPerSecond = 0;
const targetSubscribers = 10000;
let gameRunning = true;
let lastIntegerSubscribers = 0;

let engine, render, runner;
let activeBalls = [];
const maxBalls = 200;

const subscriberImagesConfig = [
    // { url: "asset/sub/0.png", width: 0, height: 0 },
    { url: "asset/sub/1.png", width: 0, height: 0 },
    { url: "asset/sub/2.png", width: 0, height: 0 },
    { url: "asset/sub/3.png", width: 0, height: 0 },
    { url: "asset/sub/4.png", width: 0, height: 0 },
    { url: "asset/sub/5.png", width: 0, height: 0 },
    { url: "asset/sub/6.png", width: 0, height: 0 },
    { url: "asset/sub/7.png", width: 0, height: 0 },
    { url: "asset/sub/8.png", width: 0, height: 0 },
    { url: "asset/sub/9.png", width: 0, height: 0 },
];
const ballRadius = 30;

const upgrades = [
    {
        id: "video-tier1",
        name: "發布短影片",
        description: "+5 訂閱者",
        cost: 5,
        effect: { type: "subscribers", value: 5 },
        buttonText: "發布短影片 (+5 訂閱者, 費用: 5 金幣)",
        purchased: false,
    },
    {
        id: "income-tier1",
        name: "啟用廣告",
        description: "每個訂閱者每秒金幣 +0.01",
        cost: 10,
        effect: { type: "incomePerSubscriber", value: 0.01 },
        buttonText: "啟用廣告 (每個訂閱者每秒金幣 +0.01, 費用: 10 金幣)",
        purchased: false,
    },
    {
        id: "click-tier1",
        name: "優化點擊收益",
        description: "每次點擊金幣 +0.1",
        cost: 15,
        effect: { type: "goldPerClick", value: 0.1 },
        buttonText: "優化點擊收益 (每次點擊金幣 +0.1, 費用: 15 金幣)",
        purchased: false,
    },
    {
        id: "video-tier2",
        name: "發布教學影片",
        description: "+15 訂閱者",
        cost: 25,
        effect: { type: "subscribers", value: 15 },
        buttonText: "發布教學影片 (+15 訂閱者, 費用: 25 金幣)",
        purchased: false,
    },
    {
        id: "income-tier2",
        name: "開啟頻道會員",
        description: "每個訂閱者每秒金幣 +0.02",
        cost: 50,
        effect: { type: "incomePerSubscriber", value: 0.02 },
        buttonText: "開啟頻道會員 (每個訂閱者每秒金幣 +0.02, 費用: 50 金幣)",
        purchased: false,
    },
    {
        id: "video-tier3",
        name: "發布系列影片",
        description: "+30 訂閱者",
        cost: 100,
        effect: { type: "subscribers", value: 30 },
        buttonText: "發布系列影片 (+30 訂閱者, 費用: 100 金幣)",
        purchased: false,
    },
    {
        id: "income-tier3",
        name: "接受小額贊助",
        description: "每個訂閱者每秒金幣 +0.03",
        cost: 200,
        effect: { type: "incomePerSubscriber", value: 0.03 },
        buttonText: "接受小額贊助 (每個訂閱者每秒金幣 +0.03, 費用: 200 金幣)",
        purchased: false,
    },
    {
        id: "click-tier2",
        name: "強化點擊獎勵",
        description: "每次點擊金幣 +0.5",
        cost: 300,
        effect: { type: "goldPerClick", value: 0.5 },
        buttonText: "強化點擊獎勵 (每次點擊金幣 +0.5, 費用: 300 金幣)",
        purchased: false,
    },
    {
        id: "video-tier4",
        name: "與其他Youtuber合作",
        description: "+75 訂閱者",
        cost: 500,
        effect: { type: "subscribers", value: 75 },
        buttonText: "與其他Youtuber合作 (+75 訂閱者, 費用: 500 金幣)",
        purchased: false,
    },
    {
        id: "income-tier4",
        name: "推出周邊商品",
        description: "每個訂閱者每秒金幣 +0.05",
        cost: 1000,
        effect: { type: "incomePerSubscriber", value: 0.05 },
        buttonText: "推出周邊商品 (每個訂閱者每秒金幣 +0.05, 費用: 1000 金幣)",
        purchased: false,
    },
    {
        id: "video-tier5",
        name: "舉辦線上活動",
        description: "+150 訂閱者",
        cost: 1500,
        effect: { type: "subscribers", value: 150 },
        buttonText: "舉辦線上活動 (+150 訂閱者, 費用: 1500 金幣)",
        purchased: false,
    },
    {
        id: "income-tier5",
        name: "品牌置入合作",
        description: "每個訂閱者每秒金幣 +0.05",
        cost: 2500,
        effect: { type: "incomePerSubscriber", value: 0.05 },
        buttonText: "品牌置入合作 (每個訂閱者每秒金幣 +0.05, 費用: 2500 金幣)",
        purchased: false,
    },
    {
        id: "click-tier3",
        name: "點擊金幣大放送",
        description: "每次點擊金幣 +2.0",
        cost: 3000,
        effect: { type: "goldPerClick", value: 2.0 },
        buttonText: "點擊金幣大放送 (每次點擊金幣 +2.0, 費用: 3000 金幣)",
        purchased: false,
    },
    {
        id: "video-tier6",
        name: "電視節目曝光",
        description: "+300 訂閱者",
        cost: 4000,
        effect: { type: "subscribers", value: 300 },
        buttonText: "電視節目曝光 (+300 訂閱者, 費用: 4000 金幣)",
        purchased: false,
    },
    {
        id: "income-tier6",
        name: "簽訂經紀約",
        description: "每個訂閱者每秒金幣 +0.1",
        cost: 5500,
        effect: { type: "incomePerSubscriber", value: 0.1 },
        buttonText: "簽訂經紀約 (每個訂閱者每秒金幣 +0.1, 費用: 5500 金幣)",
        purchased: false,
    },
    {
        id: "video-tier7",
        name: "國際級合作",
        description: "+500 訂閱者",
        cost: 11000,
        effect: { type: "subscribers", value: 500 },
        buttonText: "國際級合作 (+500 訂閱者, 費用: 11000 金幣)",
        purchased: false,
    },
    {
        id: "click-tier4",
        name: "超級點擊加成",
        description: "每次點擊金幣 +5.0",
        cost: 15000,
        effect: { type: "goldPerClick", value: 5.0 },
        buttonText: "超級點擊加成 (每次點擊金幣 +5.0, 費用: 15000 金幣)",
        purchased: false,
    },
    {
        id: "income-tier7",
        name: "投資多元平台",
        description: "每個訂閱者每秒金幣 +0.1",
        cost: 20000,
        effect: { type: "incomePerSubscriber", value: 0.1 },
        buttonText: "投資多元平台 (每個訂閱者每秒金幣 +0.1, 費用: 20000 金幣)",
        purchased: false,
    },
    {
        id: "video-tier8",
        name: "發布個人專輯",
        description: "+1000 訂閱者",
        cost: 25000,
        effect: { type: "subscribers", value: 1000 },
        buttonText: "發布個人專輯 (+1000 訂閱者, 費用: 25000 金幣)",
        purchased: false,
    },
    {
        id: "income-tier8",
        name: "成立個人工作室",
        description: "每個訂閱者每秒金幣 +0.1",
        cost: 40000,
        effect: { type: "incomePerSubscriber", value: 0.1 },
        buttonText: "成立個人工作室 (每個訂閱者每秒金幣 +0.1, 費用: 40000 金幣)",
        purchased: false,
    },
    {
        id: "video-tier9",
        name: "舉辦世界巡迴見面會",
        description: "+2000 訂閱者",
        cost: 60000,
        effect: { type: "subscribers", value: 2000 },
        buttonText: "舉辦世界巡迴見面會 (+2000 訂閱者, 費用: 60000 金幣)",
        purchased: false,
    },
    {
        id: "click-tier5",
        name: "點擊金幣帝國",
        description: "每次點擊金幣 +20.0",
        cost: 70000,
        effect: { type: "goldPerClick", value: 20.0 },
        buttonText: "點擊金幣帝國 (每次點擊金幣 +20.0, 費用: 70000 金幣)",
        purchased: false,
    },
    {
        id: "income-tier9",
        name: "跨國媒體集團入股",
        description: "每個訂閱者每秒金幣 +0.25",
        cost: 88000,
        effect: { type: "incomePerSubscriber", value: 0.25 },
        buttonText: "跨國媒體集團入股 (每個訂閱者每秒金幣 +0.25, 費用: 88000 金幣)",
        purchased: false,
    },
    {
        id: "video-final",
        name: "YouTube 殿堂級成就",
        description: "+5000 訂閱者",
        cost: 100000,
        effect: { type: "subscribers", value: 5000 },
        buttonText: "YouTube 殿堂級成就 (+5000 訂閱者, 費用: 100000 金幣)",
        purchased: false,
    },
];

const subscriberCountDisplay = document.getElementById("subscriber-count");
const goldCountDisplay = document.getElementById("gold-count");
const goldPerSecondDisplay = document.getElementById("gold-per-second");
const newSubscribersPerSecondDisplay = document.getElementById("new-subscribers-per-second");
const goldPerClickDisplay = document.getElementById("gold-per-click");
const upgradeButtonsContainer = document.getElementById("upgrade-buttons-container");
const congratulationsModal = document.getElementById("congratulations-modal");
const congratulationsMessage = document.getElementById("congratulations-message");
const modalCloseButton = document.getElementById("modal-close-button");
const messageBox = document.getElementById("message-box");

function showMessageBox(message, type = "info") {
    messageBox.textContent = message;
    messageBox.className = "show";
    messageBox.style.backgroundColor = "";
    if (type === "success") {
        messageBox.style.backgroundColor = "#48bb78";
    } else if (type === "error") {
        messageBox.style.backgroundColor = "#f56565";
    } else {
        messageBox.style.backgroundColor = "#f6ad55";
    }

    setTimeout(() => {
        messageBox.className = "hidden";
    }, 3000);
}

async function preloadSubscriberImages() {
    const promises = subscriberImagesConfig.map(async (imgConfig) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                imgConfig.width = img.naturalWidth;
                imgConfig.height = img.naturalHeight;
                resolve();
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${imgConfig.url}. Using fallback dimensions.`);
                imgConfig.width = 100;
                imgConfig.height = 100;
                resolve();
            };
            img.src = imgConfig.url;
        });
    });
    await Promise.all(promises);
    console.log("所有訂閱者圖片已預載入，包含尺寸資訊:", subscriberImagesConfig);
}

function createWorld() {
    if (runner) {
        Runner.stop(runner);
    }
    if (render) {
        Render.stop(render);
        if (render.canvas && render.canvas.parentNode) {
            render.canvas.remove();
        }
        render.canvas = null;
        render.context = null;
        render.textures = {};
    }
    if (engine) {
        World.clear(engine.world);
        Engine.clear(engine);
    }

    const canvasContainer = document.getElementById("canvas-container");
    if (!canvasContainer) {
        console.error("Canvas container not found! Cannot create Matter.js world.");
        return;
    }

    let width = canvasContainer.clientWidth;
    let height = canvasContainer.clientHeight;

    if (width === 0 || height === 0) {
        console.warn("Canvas container dimensions are zero. Using fallback dimensions.");
        width = window.innerWidth * 0.7;
        height = window.innerHeight * 0.7;
    }

    console.log(`Creating Matter.js world with dimensions: Width=${width}, Height=${height}`);

    engine = Engine.create();
    engine.world.gravity.y = 0.8;

    render = Render.create({
        element: canvasContainer,
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false,
            background: "transparent",
            pixelRatio: window.devicePixelRatio,
        },
    });

    const walls = [
        Bodies.rectangle(width / 2, height, width, 40, {
            isStatic: true,
            render: { fillStyle: "#4A5568" },
            restitution: 0.8,
        }),
        Bodies.rectangle(0, height / 2, 40, height, {
            isStatic: true,
            render: { fillStyle: "#4A5568" },
            restitution: 0.8,
        }),
        Bodies.rectangle(width, height / 2, 40, height, {
            isStatic: true,
            render: { fillStyle: "#4A5568" },
            restitution: 0.8,
        }),
    ];
    World.add(engine.world, walls);

    activeBalls = [];

    Render.run(render);
    runner = Runner.create();
    Runner.run(runner, engine);

    addBalls(1);

    render.canvas.addEventListener("click", (event) => {
        if (gameRunning) {
            gold += goldPerClick;
            gold = parseFloat(gold.toFixed(2));
            showMessageBox(`點擊獲得 +${goldPerClick.toFixed(2)} 金幣！`, "info");
            updateUI();
        }
    });
}

function createSubscriberBall(x, y) {
    if (subscriberImagesConfig.length === 0) {
        console.warn("No subscriber image configurations found. Using a default placeholder.");
        const defaultImage = "https://placehold.co/50x50/CCCCCC/000000?text=SUB";
        const ball = Bodies.circle(x, y, ballRadius, {
            restitution: 0.7,
            friction: 0.001,
            frictionAir: 0.01,
            render: {
                sprite: {
                    texture: defaultImage,
                    xScale: (ballRadius * 2) / 50,
                    yScale: (ballRadius * 2) / 50,
                },
                fillStyle: "#FFD700",
            },
            angle: Math.random() * Math.PI * 2,
        });
        Body.setVelocity(ball, { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 });
        Body.setAngularVelocity(ball, (Math.random() - 0.5) * 0.1);
        return ball;
    }

    const randomImageConfig =
        subscriberImagesConfig[Math.floor(Math.random() * subscriberImagesConfig.length)];
    const imageWidth = randomImageConfig.width;
    const imageHeight = randomImageConfig.height;

    let renderOptions = {
        fillStyle: "#FFD700",
    };

    if (randomImageConfig.url && imageWidth > 0 && imageHeight > 0) {
        renderOptions.sprite = {
            texture: randomImageConfig.url,
            xScale: (ballRadius * 2) / imageWidth,
            yScale: (ballRadius * 2) / imageHeight,
        };
    } else {
        renderOptions.fillStyle = "#CCCCCC";
        console.warn(
            `Image for ball failed to load or has invalid dimensions: ${randomImageConfig.url}. Using fallback color.`
        );
    }

    const ball = Bodies.circle(x, y, ballRadius, {
        restitution: 0.7,
        friction: 0.001,
        frictionAir: 0.01,
        render: renderOptions,
        angle: Math.random() * Math.PI * 2,
    });

    Body.setVelocity(ball, {
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 5,
    });
    Body.setAngularVelocity(ball, (Math.random() - 0.5) * 0.1);

    return ball;
}

function addBalls(count) {
    const canvasContainer = document.getElementById("canvas-container");
    if (!canvasContainer) return;
    const width = canvasContainer.clientWidth;

    for (let i = 0; i < count; i++) {
        if (activeBalls.length >= maxBalls) {
            const ballToRemove = activeBalls.shift();
            World.remove(engine.world, ballToRemove);
        }
        const x = Math.random() * (width - ballRadius * 2) + ballRadius;
        const y = -Math.random() * 200;

        const newBall = createSubscriberBall(x, y);
        activeBalls.push(newBall);
        World.add(engine.world, newBall);
    }
}

function applyUpgrade(upgradeId) {
    const upgrade = upgrades.find((u) => u.id === upgradeId);

    if (!upgrade) {
        console.error(`Upgrade with ID ${upgradeId} not found.`);
        return;
    }

    if (upgrade.purchased) {
        showMessageBox(`${upgrade.name} 已購買，無法重複購買！`, "info");
        return;
    }

    if (parseFloat(gold.toFixed(2)) >= upgrade.cost) {
        gold -= upgrade.cost;
        gold = parseFloat(gold.toFixed(2));

        if (upgrade.effect.type === "subscribers") {
            subscribers += upgrade.effect.value;
            addBalls(upgrade.effect.value);
            showMessageBox(`${upgrade.name}！獲得 ${upgrade.effect.value} 訂閱者！`, "success");
        } else if (upgrade.effect.type === "incomePerSubscriber") {
            incomePerSubscriber += upgrade.effect.value;
            showMessageBox(
                `${upgrade.name}！每個訂閱者每秒金幣 +${upgrade.effect.value.toFixed(3)}！`,
                "success"
            );
        } else if (upgrade.effect.type === "goldPerClick") {
            goldPerClick += upgrade.effect.value;
            showMessageBox(
                `${upgrade.name}！每次點擊金幣 +${upgrade.effect.value.toFixed(1)}！`,
                "success"
            );
        }
        upgrade.purchased = true;
    } else {
        showMessageBox("金幣不足！", "error");
    }
    updateUI();
}

function renderUpgradeButtons() {
    upgradeButtonsContainer.innerHTML = "";

    upgrades.forEach((upgrade) => {
        if (!upgrade.purchased) {
            const button = document.createElement("button");
            button.id = `upgrade-${upgrade.id}`;
            button.className = "upgrade-button";
            button.textContent = upgrade.buttonText;
            button.disabled = parseFloat(gold.toFixed(2)) < upgrade.cost;
            button.addEventListener("click", () => applyUpgrade(upgrade.id));

            upgradeButtonsContainer.appendChild(button);
        }
    });
}

function updateUI() {
    subscriberCountDisplay.textContent = Math.floor(subscribers);
    goldCountDisplay.textContent = gold.toFixed(2);
    goldPerSecond = Math.floor(subscribers) * incomePerSubscriber;
    goldPerSecondDisplay.textContent = goldPerSecond.toFixed(2);
    newSubscribersPerSecondDisplay.textContent = newSubscribersPerSecond.toFixed(2);
    goldPerClickDisplay.textContent = goldPerClick.toFixed(2);

    renderUpgradeButtons();
}

function gameLoop() {
    if (!gameRunning) return;

    gold += goldPerSecond;
    gold = parseFloat(gold.toFixed(2));

    const currentIntegerSubscribers = Math.floor(subscribers);

    newSubscribersPerSecond = subscribers / 100;
    subscribers += newSubscribersPerSecond;

    if (Math.floor(subscribers) > currentIntegerSubscribers) {
        const newBallsToDrop = Math.floor(subscribers) - currentIntegerSubscribers;
        addBalls(newBallsToDrop);
    }
    lastIntegerSubscribers = Math.floor(subscribers);

    if (subscribers >= targetSubscribers && gameRunning) {
        gameRunning = false;
        congratulationsMessage.textContent = `恭喜您的朋友達到 ${targetSubscribers} 訂閱！`;
        congratulationsModal.classList.add("show");
    }

    updateUI();
}

modalCloseButton.addEventListener("click", () => {
    congratulationsModal.classList.remove("show");
});

let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        createWorld();
        updateUI();
    }, 250);
});

window.onload = function () {
    preloadSubscriberImages()
        .then(() => {
            lastIntegerSubscribers = Math.floor(subscribers);
            setTimeout(() => {
                createWorld();
                updateUI();
                setInterval(gameLoop, 1000);
            }, 100);
        })
        .catch((error) => {
            console.error("圖片預載入失敗:", error);
            setTimeout(() => {
                createWorld();
                updateUI();
                setInterval(gameLoop, 1000);
            }, 100);
        });
};
