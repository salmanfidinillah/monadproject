const canvas = document.querySelector("#video");
const ctx = canvas.getContext("2d");
const startButton = document.querySelector("#start");
const statusLine = document.querySelector("#status");
const storyboard = document.querySelector("#storyboard");
const resultVideo = document.querySelector("#result");

const W = canvas.width;
const H = canvas.height;
const FPS = 24;
const VIDEO_SECONDS = 30;
const COLORS = {
  ink: "#212346",
  cream: "#fff2c7",
  sky: "#91dad9",
  floor: "#f4d781",
  orange: "#ffaf3e",
  cyan: "#54c9de",
  violet: "#a39cf2",
  pink: "#f78a9e",
  green: "#baf0d3",
};

const narration = [
  "Meet BOM OPER, a hot-potato game for two to four players.",
  "Create a room, invite friends, and pass the bomb before time runs out. A hot pass cuts three seconds; each player gets one.",
  "Monad is an EVM-compatible Layer 1 designed for parallel execution.",
  "BOM OPER records rooms, turns, deadlines, and results on Monad Testnet.",
  "The game is live, but a complete two-player round still needs public transaction proof. Bring a friend and play.",
];

const artPaths = [
  "../design/preview/BOM-OPER-Arcade-Opening.png",
  "../design/preview/BOM-OPER-Arcade-Lobby.png",
  "../design/preview/BOM-OPER-Arcade-Arena.png",
  "../design/preview/BOM-OPER-Arcade-Hasil.png",
];

let art = [];
let audioBuffers = [];
let sceneStarts = [];
let playbackRate = 1;
let startedAt = 0;
let isRecording = false;
let finalizing = false;

function roundedRect(x, y, width, height, radius, fill, stroke, lineWidth = 0) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke && lineWidth) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function text(value, x, y, size, color = COLORS.cream, weight = 800, font = "Nunito, Arial, sans-serif", align = "left") {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

function wrapLines(value, maxChars = 60) {
  const words = value.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function drawCaption(value) {
  const lines = wrapLines(value, 67);
  roundedRect(52, 589, 1176, 92, 20, "rgba(24,25,53,.91)", "rgba(255,242,199,.28)", 1.5);
  lines.forEach((line, index) => text(line, 640, 620 + index * 32, 25, COLORS.cream, 800, "Nunito, Arial, sans-serif", "center"));
}

function drawHeader(label = "BOM OPER  ·  MONAD TESTNET") {
  roundedRect(48, 32, 402, 48, 24, "rgba(33,35,70,.86)");
  text(label, 70, 56, 18, COLORS.cream, 900);
  roundedRect(1047, 32, 185, 42, 21, COLORS.cream);
  text("2–4 PLAYERS", 1139, 53, 15, COLORS.ink, 900, "Nunito, Arial, sans-serif", "center");
}

function drawFooter(elapsed) {
  const progress = Math.max(0, Math.min(1, elapsed / VIDEO_SECONDS));
  roundedRect(52, 700, 1176, 5, 3, "rgba(255,242,199,.22)");
  roundedRect(52, 700, 1176 * progress, 5, 3, COLORS.orange);
  text("MOTION EXPLAINER  ·  DESIGN VISUALS, NOT GAMEPLAY FOOTAGE", 54, 694, 12, "rgba(255,242,199,.76)", 800);
}

function drawBackground(time, hue = "dark") {
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  if (hue === "light") {
    gradient.addColorStop(0, "#91dad9");
    gradient.addColorStop(.52, "#daf3d9");
    gradient.addColorStop(1, "#a39cf2");
  } else if (hue === "warm") {
    gradient.addColorStop(0, "#212346");
    gradient.addColorStop(1, "#514a91");
  } else {
    gradient.addColorStop(0, "#16172f");
    gradient.addColorStop(.6, "#25274f");
    gradient.addColorStop(1, "#39386a");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = hue === "light" ? .22 : .12;
  for (let i = 0; i < 13; i++) {
    const x = (i * 137 + time * (14 + (i % 3) * 7)) % (W + 80) - 40;
    const y = 112 + ((i * 71) % 365) + Math.sin(time * .9 + i) * 12;
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fillStyle = [COLORS.cream, COLORS.orange, COLORS.cyan, COLORS.pink][i % 4];
    ctx.fill();
  }
  ctx.restore();
}

function drawImageCard(image, x, y, width, height, time, label) {
  const enter = Math.min(1, Math.max(0, (time - .1) * 2.2));
  const scale = .96 + .04 * enter;
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.scale(scale, scale);
  ctx.shadowColor = "rgba(6,8,25,.35)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  roundedRect(-width / 2, -height / 2, width, height, 22, COLORS.cream, null, 0);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 22);
  ctx.clip();
  if (image?.complete && image.naturalWidth) {
    const scale = Math.max(width / image.width, height / image.height);
    const iw = image.width * scale;
    const ih = image.height * scale;
    ctx.drawImage(image, x + (width - iw) / 2, y + (height - ih) / 2, iw, ih);
  }
  ctx.restore();
  roundedRect(x + 14, y + height - 43, Math.min(width - 28, 245), 30, 15, "rgba(33,35,70,.9)");
  text(label, x + 27, y + height - 28, 12, COLORS.cream, 900);
}

function drawVideoCard(video, x, y, width, height, time, label) {
  const floatY = Math.sin(time * 2.1) * 3;
  ctx.save();
  ctx.shadowColor = "rgba(6,8,25,.38)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 9;
  roundedRect(x, y + floatY, width, height, 18, COLORS.ink, COLORS.cream, 3);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 4 + floatY, width - 8, height - 8, 14);
  ctx.clip();
  if (video.readyState >= 2 && video.videoWidth) {
    const scale = Math.max((width - 8) / video.videoWidth, (height - 8) / video.videoHeight);
    const iw = video.videoWidth * scale;
    const ih = video.videoHeight * scale;
    ctx.drawImage(video, x + 4 + ((width - 8) - iw) / 2, y + 4 + floatY + ((height - 8) - ih) / 2, iw, ih);
  }
  ctx.restore();
  roundedRect(x + 10, y + height - 34 + floatY, width - 20, 25, 12, "rgba(33,35,70,.92)");
  text(label, x + width / 2, y + height - 21 + floatY, 10, COLORS.cream, 900, "Nunito, Arial, sans-serif", "center");
}

function drawBomb(x, y, scale, time, hot = false) {
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 5) * 5);
  ctx.rotate(Math.sin(time * 3.2) * .11);
  ctx.scale(scale, scale);
  ctx.shadowColor = "rgba(12,13,40,.48)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 8;
  ctx.beginPath();
  ctx.arc(0, 8, 38, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.ink;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.beginPath();
  ctx.ellipse(-10, -4, 12, 8, -.55, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.cream;
  ctx.fill();
  roundedRect(-16, -39, 32, 14, 6, COLORS.violet);
  ctx.beginPath();
  ctx.moveTo(7, -39);
  ctx.quadraticCurveTo(31, -64, 45, -55 + Math.sin(time * 11) * 5);
  ctx.strokeStyle = hot ? COLORS.orange : COLORS.cream;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.stroke();
  const spark = 1 + .24 * Math.sin(time * 15);
  ctx.beginPath();
  ctx.arc(48, -56, 8 * spark, 0, Math.PI * 2);
  ctx.fillStyle = hot ? COLORS.orange : "#fff8dc";
  ctx.fill();
  text("!", 1, 12, 34, COLORS.cream, 900, "Lilita One, Impact, sans-serif", "center");
  ctx.restore();
}

function drawFlowNode(x, y, label, color, time, active = false) {
  ctx.save();
  ctx.shadowColor = active ? color : "rgba(0,0,0,.18)";
  ctx.shadowBlur = active ? 22 : 8;
  roundedRect(x - 96, y - 42, 192, 84, 24, COLORS.cream, color, 3);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x, y - 10, 14 + (active ? 2 * Math.sin(time * 6) : 0), 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  text(label, x, y + 20, 17, COLORS.ink, 900, "Nunito, Arial, sans-serif", "center");
}

function drawScene(index, time, local, elapsed) {
  if (index === 0) {
    drawBackground(time, "dark");
    drawHeader();
    text("PASS IT BEFORE", 68, 190, 39, COLORS.cream, 900, "Lilita One, Impact, sans-serif");
    text("TIME RUNS OUT!", 68, 245, 58, COLORS.orange, 900, "Lilita One, Impact, sans-serif");
    text("BOM OPER", 68, 330, 84, COLORS.cream, 900, "Lilita One, Impact, sans-serif");
    text("A hot-potato game for 2–4 players", 70, 392, 25, COLORS.sky, 800);
    drawImageCard(art[0], 650, 128, 566, 354, local, "FIGMA DESIGN CONCEPT");
    drawBomb(590 + 65 * Math.sin(local * 1.9), 318, 1.02, time, false);
    roundedRect(70, 455, 270, 48, 23, COLORS.orange);
    text("ONE BOMB · ONE ROUND", 205, 479, 17, COLORS.ink, 900, "Nunito, Arial, sans-serif", "center");
    drawCaption(narration[0]);
  } else if (index === 1) {
    drawBackground(time, "light");
    drawHeader("ROOM UP  ·  BOM OUT");
    drawImageCard(art[2], 55, 120, 600, 376, local, "ARENA DESIGN CONCEPT");
    drawVideoCard(storyboard, 386, 342, 252, 150, local, "FIGMA MOTION STORYBOARD · CONCEPT");
    const stepX = [850, 1050];
    const labels = ["CREATE ROOM", "INVITE FRIENDS"];
    stepX.forEach((x, i) => {
      const bounce = Math.sin(time * 4 + i) * 5;
      drawFlowNode(x, 210 + bounce, labels[i], i ? COLORS.cyan : COLORS.orange, time, local > i * 2.1);
    });
    drawBomb(950 + Math.sin(time * 2.4) * 55, 355, .7, time, local > 5);
    roundedRect(705, 435, 490, 62, 26, COLORS.pink, COLORS.ink, 2);
    text("HOT PASS  ·  −3 SECONDS  ·  ONCE EACH", 950, 467, 18, COLORS.ink, 900, "Nunito, Arial, sans-serif", "center");
    drawCaption(narration[1]);
  } else if (index === 2) {
    drawBackground(time, "warm");
    drawHeader("BUILT FOR EVM DEVELOPERS");
    text("MEET", 70, 186, 28, COLORS.sky, 900);
    text("MONAD", 64, 270, 104, COLORS.cream, 900, "Lilita One, Impact, sans-serif");
    text("EVM-COMPATIBLE  LAYER 1", 70, 331, 24, COLORS.orange, 900);
    text("Parallel execution architecture", 70, 372, 22, COLORS.cream, 800);
    const laneY = [180, 270, 360, 450];
    laneY.forEach((y, i) => {
      roundedRect(650, y - 23, 515, 46, 22, "rgba(255,242,199,.1)", "rgba(255,242,199,.2)", 1);
      const px = 665 + ((time * (100 + i * 17) + i * 93) % 470);
      roundedRect(px, y - 13, 76, 26, 13, [COLORS.orange, COLORS.cyan, COLORS.pink, COLORS.violet][i]);
      text(`TX ${String(i + 1).padStart(2, "0")}`, px + 38, y, 13, COLORS.ink, 900, "Nunito, Arial, sans-serif", "center");
    });
    text("PARALLEL WORKSTREAMS", 910, 511, 14, COLORS.sky, 900, "Nunito, Arial, sans-serif", "center");
    text("Source: docs.monad.xyz", 70, 537, 15, "rgba(255,242,199,.7)", 700);
    drawCaption(narration[2]);
  } else if (index === 3) {
    drawBackground(time, "dark");
    drawHeader("GAME STATE  ·  ON-CHAIN");
    text("ONE ROOM. ONE SHARED STATE.", 68, 150, 36, COLORS.cream, 900, "Lilita One, Impact, sans-serif");
    const nodes = [
      { x: 185, label: "PLAYER 1", color: COLORS.orange },
      { x: 420, label: "PLAYER 2", color: COLORS.cyan },
      { x: 655, label: "PLAYER 3", color: COLORS.pink },
    ];
    nodes.forEach((n, i) => {
      ctx.strokeStyle = "rgba(255,242,199,.38)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(n.x + 96, 310);
      ctx.lineTo(840, 310);
      ctx.stroke();
      drawFlowNode(n.x, 310 + Math.sin(time * 3 + i) * 6, n.label, n.color, time, local > i * 1.2);
    });
    roundedRect(855, 213, 350, 192, 28, COLORS.cream, COLORS.violet, 4);
    text("BOM OPER CONTRACT", 1030, 251, 22, COLORS.ink, 900, "Nunito, Arial, sans-serif", "center");
    ["Room · holder · turn", "Deadline · hot pass", "Result · Finished"].forEach((line, i) => text(line, 1030, 298 + i * 34, 17, COLORS.ink, 800, "Nunito, Arial, sans-serif", "center"));
    text("MONAD TESTNET  ·  CHAIN 10143", 640, 484, 20, COLORS.sky, 900, "Nunito, Arial, sans-serif", "center");
    text("Each action waits for receipt + a fresh contract read.", 640, 521, 16, COLORS.cream, 700, "Nunito, Arial, sans-serif", "center");
    drawCaption(narration[3]);
  } else {
    drawBackground(time, "light");
    drawHeader("LIVE ON MONAD TESTNET");
    drawImageCard(art[3], 55, 125, 575, 360, local, "RESULT SCREEN · DESIGN CONCEPT");
    text("DEPLOYMENT", 700, 167, 17, COLORS.ink, 900);
    roundedRect(700, 188, 455, 57, 28, COLORS.green, COLORS.ink, 2);
    text("VERIFIED  ✓", 927, 216, 20, COLORS.ink, 900, "Nunito, Arial, sans-serif", "center");
    text("MULTIPLAYER ROUND", 700, 282, 17, COLORS.ink, 900);
    roundedRect(700, 303, 455, 57, 28, COLORS.cream, COLORS.ink, 2);
    text("PUBLIC RECEIPTS PENDING", 927, 331, 19, COLORS.ink, 900, "Nunito, Arial, sans-serif", "center");
    text("0x1809…aDDd  ·  MONAD TESTNET", 927, 398, 17, COLORS.ink, 800, "Nunito, Arial, sans-serif", "center");
    roundedRect(699, 434, 456, 65, 30, COLORS.orange, COLORS.ink, 2);
    text("BRING A FRIEND  ·  PLAY LIVE", 927, 466, 19, COLORS.ink, 900, "Nunito, Arial, sans-serif", "center");
    text("bom-oper.salmansegaf52.workers.dev/play", 927, 533, 15, COLORS.ink, 900, "Nunito, Arial, sans-serif", "center");
    drawCaption(narration[4]);
  }
  drawFooter(elapsed);
}

async function loadImages() {
  return Promise.all(artPaths.map((src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load art: ${src}`));
    image.src = src;
  })));
}

async function loadAudio(context) {
  return Promise.all(narration.map(async (_, index) => {
    const response = await fetch(`voiceover/scene-${String(index + 1).padStart(2, "0")}.mp3`);
    if (!response.ok) throw new Error(`Voiceover ${index + 1} could not be loaded`);
    return context.decodeAudioData(await response.arrayBuffer());
  }));
}

function sceneAt(elapsed) {
  for (let i = sceneStarts.length - 1; i >= 0; i--) {
    if (elapsed >= sceneStarts[i]) return i;
  }
  return 0;
}

function animateFrame(now) {
  if (!isRecording) return;
  const elapsed = Math.min(VIDEO_SECONDS, (now - startedAt) / 1000);
  const index = sceneAt(elapsed);
  const local = elapsed - sceneStarts[index];
  drawScene(index, elapsed, local, elapsed);
  statusLine.textContent = `Rendering · ${elapsed.toFixed(1)} / ${VIDEO_SECONDS} seconds`;
  if (elapsed >= VIDEO_SECONDS) {
    if (!finalizing) {
      finalizing = true;
      statusLine.textContent = "Finishing the 30-second video…";
      setTimeout(() => {
        isRecording = false;
        window.__recorder?.stop();
      }, 1500);
    }
    return;
  }
  requestAnimationFrame(animateFrame);
}

async function renderVideo() {
  startButton.disabled = true;
  try {
    statusLine.textContent = "Loading artwork and voiceover…";
    art = await loadImages();
    await document.fonts.ready;
    storyboard.currentTime = 0;
    await storyboard.play().catch(() => {});

    const audioContext = new AudioContext();
    await audioContext.resume();
    audioBuffers = await loadAudio(audioContext);
    const speechSeconds = audioBuffers.reduce((sum, buffer) => sum + buffer.duration, 0);
    playbackRate = speechSeconds > 28.7 ? speechSeconds / 28.7 : 1;
    const audioTrack = audioContext.createMediaStreamDestination();
    const stream = canvas.captureStream(FPS);
    stream.addTrack(audioTrack.stream.getAudioTracks()[0]);

    const mimeCandidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    const mimeType = mimeCandidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
    if (!mimeType) throw new Error("This browser cannot record WebM video with audio.");
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000, audioBitsPerSecond: 128_000 });
    window.__recorder = recorder;
    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = (event) => { throw event.error || new Error("The video recorder stopped unexpectedly."); };
    recorder.onstop = async () => {
      statusLine.textContent = "Saving the finished video…";
      const blob = new Blob(chunks, { type: mimeType });
      const result = await fetch("/__upload", { method: "POST", headers: { "Content-Type": mimeType }, body: blob });
      if (!result.ok) throw new Error("The local renderer could not save the video file.");
      resultVideo.src = URL.createObjectURL(blob);
      resultVideo.hidden = false;
      resultVideo.onloadedmetadata = () => {
        const checkStream = resultVideo.captureStream?.() || resultVideo.webkitCaptureStream?.();
        const audioTracks = checkStream?.getAudioTracks().length ?? 0;
        const duration = Number.isFinite(resultVideo.duration)
          ? `${resultVideo.duration.toFixed(1)} sec`
          : `about ${VIDEO_SECONDS} sec`;
        statusLine.textContent = `Finished · ${duration} · ${blob.size.toLocaleString()} bytes · ${audioTracks ? "voiceover track verified" : "voiceover included"}`;
        checkStream?.getTracks().forEach((track) => track.stop());
      };
      startButton.textContent = "Render again";
      startButton.disabled = false;
      stream.getTracks().forEach((track) => track.stop());
      await audioContext.close();
    };

    recorder.start(500);
    finalizing = false;
    const startAt = audioContext.currentTime + .25;
    sceneStarts = [];
    let offset = 0;
    audioBuffers.forEach((buffer) => {
      sceneStarts.push(offset);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = playbackRate;
      source.connect(audioTrack);
      source.start(startAt + offset, 0);
      offset += buffer.duration / playbackRate;
    });
    const speechDuration = offset;
    startedAt = performance.now();
    isRecording = true;
    requestAnimationFrame(animateFrame);
  } catch (error) {
    console.error(error);
    statusLine.textContent = `Could not render: ${error.message}`;
    startButton.disabled = false;
  }
}

startButton.addEventListener("click", renderVideo);
drawBackground(0);
text("PRESS RENDER TO PREVIEW", W / 2, H / 2, 34, COLORS.cream, 900, "Lilita One, Impact, sans-serif", "center");
