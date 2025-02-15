"use strict";
//変数の定義
/**
 * データ表示用の係数。
 */
const coef = [0.0976, 2.594, 3.125, 0.1853, 0.1871]; //データ調整用係数
let totalCount = 0; //計算に入れるpxの数
let foodChart = null; //footchartの初期化
let currentStage = 0; //ステージの移る用のグローバル変数
let foodData = []; //計算に持っていくdataの配列
let menu = []; //表示のためのmenuの配列
let output = []; //fetchデータの格納用
let values;
let nutri = [];
let loadingSwitch; //loadingのステージの状態管理
let ttlData = [
  { name: "組み立てた料理", img: "loading-tomato.png", alt: "トマト" },
  { name: "栄養の働き", img: "loading-cabbage.png", alt: "キャベツ" },
  { name: "栄養の数", img: "loading-broccoli.png", alt: "ブロッコリー" },
  { name: "バランスの良い組み合わせ", img: "loading-corn.png", alt: "コーン" },
];

//----------------------html要素の読み込み--------------------//

//--------装飾-------//
const decoTop = document.querySelector(".deco-top");
const decoBottom = document.querySelector(".deco-bottom");
const decoLeft = document.querySelector(".deco-left");
const decoRight = document.querySelector(".deco-right");
const decoCamera = document.querySelector(".deco-camera");
//---------共通--------//
const ttl = document.querySelector(".ttl");
const ttlText = document.querySelector(".ttl-text");
const ttlImg = document.querySelector(".ttl-img");
const nextBtn = document.querySelectorAll(".next-btn");
//--------stage1-------//
const logo = document.querySelector(".logo");
const startBtn = document.querySelector(".start");
const logoImg = document.querySelector(".logo-img");
//--------stage2-------//
const camera = document.querySelector(".camera");
const video = document.querySelector("#video");
const camaraBtn = document.querySelector(".camera-btn");
const camaraMask = document.querySelector(".video-none");
const canvas = document.createElement("canvas");
//--------stage3-------//
const loading = document.querySelector(".loading");
const loadingIMG = [...document.querySelectorAll(".loading img")];
//--------stage4-------//
const showFood = document.querySelector(".showfood");
const showFoodImg = document.querySelector(".showfood-img");
const showFoodName = document.querySelector(".showfood-name");
const showFoodDes = document.querySelector(".showfood-description");
//--------stage5-------//
const showNutri = document.querySelector(".shownutri");
const showNutriShow = document.querySelector(".shownutri-show");
const showNutriImg = document.querySelector(".shownutri-img");
const showNutriName = document.querySelector(".shownutri-name");
const showNutriGraph = document.querySelector(".shownutri-graph");
//--------stage6-------//
const showNum = document.querySelector(".shownum");
const showNumShow = document.querySelector(".shownum-show");
const showNumImg = document.querySelector(".shownum-img");
const showNumName = document.querySelector(".shownum-name");
//--------stage7-------//
const showMenu = document.querySelector(".showmenu");
//--------stage8-------//
const last = document.querySelector(".last");
const lastBtn = document.querySelector(".last-btn");
//----------------------ロードイン--------------------//
document.addEventListener("DOMContentLoaded", function () {
  nextBtn.forEach((nextBtn) => {
    nextBtn.addEventListener("click", () => {
      console.log("nextbtn clicked!");

      switch (currentStage) {
        case 5:
          setTimeout(() => {
            stage6();
          }, 1000);
          break;
        case 6:
          setTimeout(() => {
            stage7();
          }, 1000);
          break;
        case 7:
          setTimeout(() => {
            stage8();
          }, 1000);
          break;
        default:
          console.log("処理なし or 最終ステージ");
      }
    });
  });
  startBtn.addEventListener("click", () => {
    stage2();
  });
  camaraBtn.addEventListener("click", () => {
    photoShoot(), stage3();
  });
  showFoodImg.addEventListener("click", () => {
    showFood.style.opacity = "0";
    showFood.style.transform = "scale(0)";
    setTimeout(() => {
      stage5();
    }, 1000);
  });
  lastBtn.addEventListener("click", () => {
    last.style.display = "none";
    setTimeout(() => {
      start();
    }, 500);
  });
  start();
});

function start() {
  decoTop.style.transform = "translateY(-100%)";
  decoBottom.style.transform = "translateY(100%)";
  decoLeft.style.transform = "translateX(-100%)";
  decoRight.style.transform = "translateX(100%)";
  logoImg.style.transform = "scale(0)";
  startBtn.style.transform = "scale(0)";
  camera.style.transform = "scale(0)";
  camera.style.opacity = "0";
  initVideoCamera();
  setTimeout(stage1, 500);
}
//----------------------仕組みの関数--------------------//

/**
 * 食べ物のデータの取得する
 */

async function fetchData(colors) {
  try {
    const response = await fetch("../data.json"); // JSONファイルを取得
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); // JSONデータを取得して配列化
    foodData = data.fooddata;
    menu = data.menu;
    let smallestDifference = Infinity;
    let closestFood = null;

    foodData.forEach((food, index) => {
      const nutrition = food.nutrition;
      // チャット、計算用の調整数値
      const nutritionChart = {
        carbohydrates: nutrition.carbohydrates * coef[0],
        protein: nutrition.protein * coef[1],
        fat: nutrition.fat * coef[2],
        minerals: nutrition.minerals * coef[3],
        vitamin: nutrition.vitamin * coef[4],
      };
      // 各栄養素のパーセント値を求めるためにまずトータルを計算
      const nutritionTotal = Object.values(nutritionChart).reduce(
        (sum, value) => sum + value,
        0
      );

      // 各栄養素のパーセント値を使用
      const nutritionRatios = {
        carbohydrates: nutritionChart.carbohydrates / nutritionTotal,
        protein: nutritionChart.protein / nutritionTotal,
        fat: nutritionChart.fat / nutritionTotal,
        minerals: nutritionChart.minerals / nutritionTotal,
        vitamin: nutritionChart.vitamin / nutritionTotal,
      };
      console.log(nutritionRatios);
      const difference = Object.values(nutritionRatios).reduce(
        (acc, value, index) => acc + Math.abs(value - colors[index]),
        0
      );
      console.log(difference);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestFood = index;
        output = [nutrition, nutritionChart, nutritionRatios];
      }
    });
    console.log(output);
    console.log("最も近い食品:", closestFood);
    const food = foodData[closestFood];
    // HTMLに内容を設定
    updatefoodChart(food, output);
    return data;
  } catch (error) {
    console.error("JSON読み込みエラー:", error);
  }
}
/**
 * チャット生成とテキストの出力
 */
function updatefoodChart(food, input) {
  const ctx = document.getElementById("shownum-chart").getContext("2d");
  const showName = food.food;
  const showPic = food.image;
  nutri = input;
  if (!nutri || nutri.length < 2) {
    console.error("updatefoodChart: nutri data is invalid.");
    return;
  }
  showFoodName.innerHTML = showName;
  showFoodImg.src = `./img/foods/${showPic}`;
  showNumName.innerHTML = showName;
  showNumImg.src = `./img/foods/${showPic}`;
  showNutriName.innerHTML = showName;
  showNutriImg.src = `./img/foods/${showPic}`;
  values = Object.values(nutri[1]);
  const maxValue = Math.max(...values); // 最大値を取得
  const suggestedMax = maxValue < 1 ? 3 : Math.min(Math.max(5, maxValue), 40);

  console.log(suggestedMax);
  const chartInterval = setInterval(() => {
    if (currentStage === 6) {
      clearInterval(chartInterval);
      if (foodChart) {
        foodChart.destroy(); // **すでに存在する場合は削除して再生成**
      }
      // 色リスト（pointBackgroundColorと同じ色）
      const colors = [
        "#4494D1", // 青
        "#EA5433", // 赤
        "#F6AD3A", // 黄色
        "#D152EB", // 紫
        "#7DC057", // 緑
      ];
      const customDashedGrid = {
        id: "customDashedGrid",
        afterDatasetsDraw(chart) {
          const { ctx, chartArea, scales } = chart;
          const radius = Math.min(chartArea.width, chartArea.height) / 2 - 94;
          const centerX = chartArea.left + chartArea.width / 2;
          const centerY = chartArea.top + chartArea.height / 2 + 18;

          ctx.save();
          ctx.strokeStyle = "rgba(0, 0, 0, 1)"; // グリッドの色
          ctx.setLineDash([5, 5]); // 破線の設定

          // 5本の円形破線を描画
          for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius / 4) * i, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.restore();
        },
      };
      // 新しいチャートを作成
      foodChart = new Chart(ctx, {
        type: "radar", // チャートの種類（例: 'bar', 'pie', 'line'）
        data: {
          labels: ["炭水化物", "たん白質", "脂質", "ミネラル", "ビタミン"], // ラベル
          datasets: [
            {
              data: values,
              backgroundColor: "rgba(222, 91, 70,0.5)",
              borderColor: "rgb(222, 91, 70)",
            },
          ],
        },
        options: {
          elements: {
            line: {
              tension: 0,
            },
          },
          animation: {
            easing: "easeInQuad", // イージング関数を文字列で指定
            duration: 2500, // アニメーションの時間（ミリ秒）
          },
          scales: {
            r: {
              backgroundColor: "white", // **円の背景色**
              pointLabels: {
                font: {
                  family: "Zen Maru Gothic, serif",
                  size: 26, // フォントサイズ（px単位）
                  weight: 700,
                },
                color: colors, // ラベルの色（オプション）
              },
              ticks: {
                display: false, // スケールの数値を非表示
                count: 5,
              },
              grid: {
                color: (ctx) => {
                  if (ctx.index === ctx.chart.scales.r.ticks.length - 1) {
                    return "rgba(0, 0, 0, 1)"; // 一番外側のグリッドは不透明
                  }
                  return "rgba(0, 0, 0, 0)"; // それ以外のグリッドは透明
                },
                circular: true,
              },
              angleLines: {
                display: true, // 軸線はそのまま表示
                color: "rgb(0,0,0)",
              },
              suggestedMin: 0, // 最小値（スケールの開始値）
              suggestedMax: suggestedMax, // 最大値（スケールの終了値）
            },
          },
          responsive: false,
          // maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: false,
            },
            // tooltip: {
            //   enabled: false,
            // },
          },
          hover: {
            mode: "nearest", // ホバー時の動作設定
            animationDuration: 0, // アニメーションを無効にする
          },
        },
        plugins: [customDashedGrid], // カスタム破線グリッドを適用
      });
    }
  });
}
/**
 * ビデオのカメラ設定(デバイスのカメラ映像をビデオに表示)
 */
function initVideoCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((e) => console.log(e));
}
function initPhoto() {
  canvas.width = video.clientWidth;
  canvas.height = video.clientHeight;
  const context = canvas.getContext("2d");
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, canvas.width, canvas.height);
  document.querySelector("#photo").src = canvas.toDataURL("image/png");
}
/**
 * 写真の撮影描画
 */
function photoShoot() {
  totalCount = 0;
  let drawSize = calcDrawSize();
  canvas.width = drawSize.width;
  canvas.height = drawSize.height;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  document.querySelector("#photo").src = canvas.toDataURL("image/png");
  processFrame(context);
}
/**
 * 描画サイズの計算
 * 縦横比が撮影(video)が大きい時は撮影の縦基準、それ以外は撮影の横基準で計算
 */
function calcDrawSize() {
  let videoRatio = video.videoHeight / video.videoWidth;
  let viewRatio = video.clientHeight / video.clientWidth;
  return videoRatio > viewRatio
    ? { height: video.clientHeight, width: video.clientHeight / videoRatio }
    : { height: video.clientWidth * videoRatio, width: video.clientWidth };
}
/**
 *フレームを処理して色認識する
 */
function processFrame(x) {
  const imageData = x.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  // 色認識（赤色を例とする）
  let redCount = 0;
  let purpleCount = 0;
  let greenCount = 0;
  let yellowCount = 0;
  let blueCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]; // 赤
    const g = data[i + 1]; // 緑
    const b = data[i + 2]; // 青
    const { h } = rgb2hsv(r, g, b); //hsvに転換
    if (h < 0) {
      return;
    }
    // 赤色の条件
    if ((h >= 0 && h < 25) || (h >= 315 && h < 360)) {
      // 赤色
      redCount++;
    }

    // 黄色の条件
    if (h >= 25 && h < 95) {
      // 黄色
      yellowCount++;
    }

    // 緑色の条件
    if (h >= 95 && h < 165) {
      // 緑色
      greenCount++;
    }

    // 青色の条件
    if (h >= 165 && h < 245) {
      // 青色
      blueCount++;
    }

    // 紫色の条件
    if (h >= 245 && h < 315) {
      // 紫色
      purpleCount++;
    }
  }

  // 結果を出力
  const redPercentage = ((redCount / totalCount) * 100).toFixed(2);
  const bluePercentage = ((blueCount / totalCount) * 100).toFixed(2);
  const purplePercentage = ((purpleCount / totalCount) * 100).toFixed(2);
  const yellowPercentage = ((yellowCount / totalCount) * 100).toFixed(2);
  const greenPercentage = ((greenCount / totalCount) * 100).toFixed(2);
  let colors = [
    bluePercentage,
    redPercentage,
    yellowPercentage,
    purplePercentage,
    greenPercentage,
  ];
  //   updateChart(colors);
  fetchData(colors);
}
//RGB値をHSV値に変換する(0～360//0-1//0-1)
function rgb2hsv(r, g, b) {
  // 引数処理
  let tmp = [r, g, b];
  if (r !== void 0 && g === void 0) {
    const cc = parseInt(
      r
        .toString()
        .replace(/[^\da-f]/gi, "")
        .replace(/^(.)(.)(.)$/, "$1$1$2$2$3$3"),
      16
    );
    tmp = [(cc >> 16) & 0xff, (cc >> 8) & 0xff, cc & 0xff];
  } else {
    for (let i in tmp) tmp[i] = Math.max(0, Math.min(255, Math.floor(tmp[i])));
  }
  [r, g, b] = tmp;

  // RGB to HSV 変換
  const v = Math.max(r, g, b),
    d = v - Math.min(r, g, b),
    s = v ? d / v : 0,
    a = [r, g, b, r, g],
    i = a.indexOf(v),
    h = s ? (((a[i + 1] - a[i + 2]) / d + i * 2 + 6) % 6) * 60 : 0;

  // 戻り値
  if (v > 0.5 && s > 0.5) {
    totalCount++;
    return { h };
  } else {
    return -1;
  }

  //v > 0.5 s
}

//-------------------ステージごとの実行------------------//
//--------stage4-7のttl--------//
function ttlMove(x) {
  ttlText.innerHTML = `${ttlData[x - 4].name}`;
  ttlImg.src = `./img/${ttlData[x - 4].img}`;
  ttlImg.alt = `${ttlData[x - 4].alt}`;

  ttl.style.display = "block";
  if (x === 4) {
    setTimeout(() => {
      ttl.style.transform = "translateX(0%)";
    }, 2000);
  } else {
    setTimeout(() => {
      ttl.style.transform = "translateX(0%)";
    }, 500);
  }
}
//--------stage1-------//
function stage1() {
  currentStage = 1;
  // まず display を block にする
  decoTop.style.display = "block";
  decoBottom.style.display = "block";
  decoLeft.style.display = "block";
  decoRight.style.display = "block";
  logo.style.display = "block";

  // 次のフレームで transform を適用する（0ミリ秒の setTimeout を使う）
  setTimeout(() => {
    decoTop.style.transform = "translateY(0)";
    decoBottom.style.transform = "translateY(0)";
    decoLeft.style.transform = "translateX(0)";
    decoRight.style.transform = "translateX(0)";
    logoImg.style.transform = "scale(1)";
    startBtn.style.transform = "scale(1)";
  }, 10);
}
//--------stage2-------//
function stage2() {
  currentStage = 2;
  decoLeft.style.display = "none";
  decoRight.style.display = "none";
  logo.style.display = "none";
  camera.style.display = "block";
  video.style.display = "block";
  setTimeout(() => {
    camera.style.transform = "scale(1)";
    camera.style.opacity = "1";
  }, 200);
  setTimeout(() => {
    camaraMask.style.transform = "scale(0)";
    camaraMask.style.opacity = "0";
  }, 1500);
}

//--------stage3-------//
function stage3() {
  currentStage = 3;
  video.style.display = "none";
  decoLeft.style.transform = "translateX(-100%)";
  decoRight.style.transform = "translateX(100%)";
  decoLeft.style.display = "block";
  decoRight.style.display = "block";
  loadingSwitch = setInterval(loadingAnimation, loadingIMG.length * 600);
  setTimeout(() => {
    decoLeft.style.transform = "translateX(0)";
    decoRight.style.transform = "translateX(0)";
  }, 2000);
  setTimeout(() => {
    camera.style.display = "none";
    loading.style.display = "flex";
  }, 1500);
  setTimeout(() => {
    stage4();
  }, 4600);
}
function loadingAnimation() {
  loadingIMG.forEach((img, index) => {
    setTimeout(() => {
      img.classList.add("active");
      // 600ms後にクラスを削除（次のループで再び追加できるように）
      setTimeout(() => img.classList.remove("active"), 500);
    }, index * 600);
  });
}
//--------stage4-------//

function stage4() {
  ttl.style.transform = "translateX(-200%)";
  currentStage = 4;
  ttlMove(currentStage);
  clearInterval(loadingSwitch);
  loadingIMG.forEach((img) => {
    img.classList.remove("active");
  });
  decoLeft.style.transform = "translateX(-100%)";
  decoRight.style.transform = "translateX(100%)";

  setTimeout(() => {
    decoLeft.style.display = "none";
    decoRight.style.display = "none";
  }, 1500);
  loading.style.display = "none";

  setTimeout(() => {
    showFood.style.display = "flex";
    showFood.style.opacity = "0.6";
    showFood.style.transform = "scale(0.6)";
  }, 2000);
  setTimeout(() => {
    showFood.style.opacity = "1";
    showFood.style.transform = "scale(1)";
  }, 2500);
}
//--------stage5-------//
function stage5() {
  ttl.style.display = "none";
  ttl.style.transform = "translateX(-200%)";
  currentStage = 5;
  showNutri.style.opacity = "0.0";
  showFood.style.display = "none";
  showNutri.style.display = "block";
  setTimeout(() => {
    ttlMove(currentStage);
  }, 10);
  setTimeout(() => {
    showNutri.style.opacity = "1";
  }, 1000);
}
//--------stage6-------//
function stage6() {
  ttl.style.display = "none";
  ttl.style.transform = "translateX(-200%)";
  currentStage = 6;
  setTimeout(() => {
    ttlMove(currentStage);
  }, 10);
  showNum.style.opacity = "0.0";
  showNutri.style.display = "none";
  showNum.style.display = " block";
  setTimeout(() => {
    showNum.style.opacity = "1";
  }, 1000);
}
//--------stage7-------//
function stage7() {
  currentStage = 7;
  ttl.style.display = "none";
  ttl.style.transform = "translateX(-200%)";
  setTimeout(() => {
    ttlMove(currentStage);
  }, 10);
  showMenu.style.opacity = "0";
  showNum.style.display = "none";
  showMenu.style.display = " block";
  setTimeout(() => {
    showMenu.style.opacity = "1";
  }, 1000);
}
//--------stage8-------//
function stage8() {
  decoLeft.style.transform = "translateX(-100%)";
  decoRight.style.transform = "translateX(100%)";
  setTimeout(() => {
    decoLeft.style.display = "block";
    decoRight.style.display = "block";
  }, 10);
  setTimeout(() => {
    decoLeft.style.transform = "translateX(0)";
    decoRight.style.transform = "translateX(0)";
  }, 700);
  ttl.style.display = "none";
  showMenu.style.display = "none";
  last.style.transform = "scale(0)";
  last.style.display = "block";
  setTimeout(() => {
    last.style.transform = "scale(1)";
  }, 700);
}
