// ===== DOM ELEMENTS =====
const rawVideo = document.getElementById('raw-video');
const canvasElement = document.getElementById('canvas-overlay');
const canvasCtx = canvasElement.getContext('2d');
const coachCanvas = document.getElementById('coach-canvas');
const coachCtx = coachCanvas ? coachCanvas.getContext('2d') : null;
const coachStatusEl = document.getElementById('coach-status');
const setupPanel = document.getElementById('setup-panel');
const setupTitle = document.getElementById('setup-title');
const setupDesc = document.getElementById('setup-desc');
const setupEmoji = document.getElementById('setup-emoji');
const setupBtn = document.getElementById('setup-btn');
const pauseBtn = document.getElementById('pause-btn');
const finishBtn = document.getElementById('finish-btn');
const repCountEl = document.getElementById('rep-count');
const repRingFill = document.getElementById('rep-ring-fill');
const formScoreEl = document.getElementById('form-score-percentage');
const caloriesEl = document.getElementById('calories-burned');
const checklistEl = document.getElementById('feedback-checklist');
const toggleVoice = document.getElementById('toggle-voice');
const toggleSfx = document.getElementById('toggle-sfx');
const sessionClockEl = document.getElementById('session-clock');

// Modal Elements
const summaryModal = document.getElementById('summary-modal');
const sumExercise = document.getElementById('sum-exercise');
const sumReps = document.getElementById('sum-reps');
const sumAccuracy = document.getElementById('sum-accuracy');
const sumCalories = document.getElementById('sum-calories');

// ===== SESSION STATE =====
let activeExercise = 'auto'; // 'auto' | 'curls' | 'squats' | 'pushups'
let autoExercise = 'curls';  // Currently auto-detected exercise (default to curls)
let isCameraActive = false;
let isSessionPaused = false;
let repCount = 0;
let validReps = 0;
let totalAttempts = 0;
let formScoreSum = 0;
let sessionStart = null;
let elapsedSeconds = 0;
let clockInterval = null;
let camera = null;
let pose = null;
let bannerTimeout = null;
let audioCtx = null;
let sfxEnabled = true;
let coachAnimationId = null;
let coachCycleTime = 0;

// Exercise repetition states
let repStates = {
  curls: {
    left: 'down', // 'down' | 'up'
    right: 'down',
    leftMinAngle: 180,
    rightMinAngle: 180,
    leftMaxAngle: 0,
    rightMaxAngle: 0
  },
  squats: {
    state: 'up', // 'up' | 'down'
    minAngle: 180,
    isTorsoGood: true
  },
  pushups: {
    state: 'up', // 'up' | 'down'
    minAngle: 180,
    isBodyLineGood: true
  }
};

// Exercise statistics (for tracking multi-exercise circuits)
let sessionStats = {
  curls: 0,
  squats: 0,
  pushups: 0
};

// Form validation flags for current frame
let currentForm = {
  curls: { elbowTucked: true, fullExtension: true },
  squats: { depthGood: true, backStraight: true },
  pushups: { bodyStraight: true, depthGood: true }
};

// Voice coach speaking throttle
let lastSpeakTime = 0;
const SPEAK_THROTTLE_MS = 3500;

// Set up drawing styles
const colors = {
  primary: '#7c3aed',   // purple
  accent: '#4ade80',    // green
  warning: '#f59e0b',   // orange
  danger: '#ef4444',    // red
  skeleton: 'rgba(255, 255, 255, 0.4)',
  skeletonJoint: '#ffffff'
};

// ===== USER PROFILE CACHE =====
const U = JSON.parse(localStorage.getItem("userData") || "{}");
const userName = U.name || "Athlete";

// ===== HELPER FUNCTIONS =====

// Exercise Auto-Detection Heuristics & Visual Sync
function detectExercise(lm, wl) {
  const hasPushupBody = (lm.leftShoulder && lm.leftHip && lm.leftAnkle && wl.leftShoulder && wl.leftHip && wl.leftAnkle) ||
                        (lm.rightShoulder && lm.rightHip && lm.rightAnkle && wl.rightShoulder && wl.rightHip && wl.rightAnkle);
  
  // 1. Push-up check: is the body axis closer to horizontal?
  if (hasPushupBody) {
    const sh = wl.leftShoulder || wl.rightShoulder;
    const ak = wl.leftAnkle || wl.rightAnkle;
    const dx = Math.abs(sh.x - ak.x);
    const dy = Math.abs(sh.y - ak.y);
    // In metric space, if dx > dy * 0.7, the body is significantly tilted/horizontal (push-up position)
    if (dx > dy * 0.7) {
      return 'pushups';
    }
  }

  // 2. Standing check:
  const hasSquatBody = (lm.leftHip && lm.leftKnee && lm.leftAnkle && wl.leftHip && wl.leftKnee && wl.leftAnkle) ||
                       (lm.rightHip && lm.rightKnee && lm.rightAnkle && wl.rightHip && wl.rightKnee && wl.rightAnkle);
  
  if (hasSquatBody) {
    const hip = wl.leftHip || wl.rightHip;
    const knee = wl.leftKnee || wl.rightKnee;
    const ankle = wl.leftAnkle || wl.rightAnkle;
    const kneeAngle = calculate3DAngle(hip, knee, ankle);
    
    // If knee is bent significantly (below 135 degrees), we are in a squat movement
    if (kneeAngle < 135) {
      return 'squats';
    }
  }

  const hasCurlBody = (lm.leftShoulder && lm.leftElbow && lm.leftWrist && wl.leftShoulder && wl.leftElbow && wl.leftWrist) ||
                      (lm.rightShoulder && lm.rightElbow && lm.rightWrist && wl.rightShoulder && wl.rightElbow && wl.rightWrist);
  
  if (hasCurlBody) {
    const sh = wl.leftShoulder || wl.rightShoulder;
    const el = wl.leftElbow || wl.rightElbow;
    const wr = wl.leftWrist || wl.rightWrist;
    const elbowAngle = calculate3DAngle(sh, el, wr);

    // If elbow is bent (below 135 degrees), and knee is relatively straight (not squatting), we are doing curls
    if (elbowAngle < 135) {
      return 'curls';
    }
  }
  
  return null;
}

function updateAutoDetectedUI(detected) {
  // Clear auto detected highlight on all option cards
  document.querySelectorAll('.ex-option-card').forEach(card => {
    card.classList.remove('auto-detected-highlight');
  });

  if (activeExercise === 'auto' && detected) {
    const card = document.getElementById(`ex-${detected}`);
    if (card) {
      card.classList.add('auto-detected-highlight');
    }
  }
}

// Vector Mathematics: Compute angle ABC (between points A, B, and C)
function calculateAngle(a, b, c) {
  if (!a || !b || !c) return 180;
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
}

// Vector Mathematics: Compute true 3D angle ABC in metric space (using MediaPipe World Landmarks)
function calculate3DAngle(a, b, c) {
  if (!a || !b || !c) return 180;
  
  // Vector BA
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  // Vector BC
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  
  // Dot product
  const dotProduct = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  
  // Magnitudes
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);
  
  if (magBA === 0 || magBC === 0) return 180;
  
  // Cosine of the angle
  let cosTheta = dotProduct / (magBA * magBC);
  // Clamp between -1 and 1 to prevent floating point inaccuracies causing NaN in acos
  cosTheta = Math.max(-1, Math.min(1, cosTheta));
  
  // Return angle in degrees
  return (Math.acos(cosTheta) * 180.0) / Math.PI;
}


// Mirror normalized landmarks coordinate system for canvas overlay
function getCanvasCoords(landmark, width, height) {
  return {
    x: (1 - landmark.x) * width,
    y: landmark.y * height
  };
}

// TTS Voice Synth
function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05; // natural slightly faster coaching vibe
    window.speechSynthesis.speak(utterance);
  }
}

// Play synthesizer chirps on rep count
function playBeep() {
  if (!toggleSfx.checked) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Chirp: quickly sweep frequency upwards
    osc.frequency.setValueAtTime(580, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {}
}

// Post real-time coach feedback to banner & speaks it (throttled)
function coachFeedback(text, isGood = false) {
  const banner = document.getElementById('feedback-banner');
  const textEl = document.getElementById('fb-text');
  const iconEl = document.getElementById('fb-icon');
  
  if (banner) {
    textEl.textContent = text;
    iconEl.textContent = isGood ? '⚡' : '⚠️';
    banner.className = `coach-feedback-banner ${isGood ? 'correct' : 'alert'}`;
    banner.style.display = 'flex';
    
    clearTimeout(bannerTimeout);
    bannerTimeout = setTimeout(() => {
      banner.style.display = 'none';
    }, 2800);
  }

  // Voice speech with throttle
  const now = Date.now();
  if (toggleVoice.checked && (now - lastSpeakTime > SPEAK_THROTTLE_MS)) {
    lastSpeakTime = now;
    speak(text);
  }
}

// Update the rep ring circular progress bar
function updateRepRing(pct) {
  const circ = 2 * Math.PI * 65; // ~408.4
  repRingFill.style.strokeDashoffset = circ * (1 - pct);
  
  // Transition color of progress ring
  if (pct > 0.8) repRingFill.style.stroke = colors.accent;
  else if (pct > 0.4) repRingFill.style.stroke = colors.primary;
  else repRingFill.style.stroke = colors.warning;
}

// Update Calories burned based on active reps
function updateStatsUI() {
  repCountEl.textContent = repCount;
  
  // Estimate calories burned
  let calTotal = 0;
  calTotal += sessionStats.curls * 0.8;
  calTotal += sessionStats.squats * 1.5;
  calTotal += sessionStats.pushups * 1.2;
  caloriesEl.textContent = Math.round(calTotal);

  // Compute form accuracy score
  let score = 100;
  if (totalAttempts > 0) {
    score = Math.round((validReps / totalAttempts) * 100);
  }
  formScoreEl.textContent = score + '%';
  if (score > 85) formScoreEl.className = 'metric-val text-glow';
  else if (score > 60) formScoreEl.className = 'metric-val text-warning';
  else formScoreEl.className = 'metric-val text-danger';
}

// ===== EXERCISE SELECTION =====
function selectExercise(type) {
  activeExercise = type;
  
  // Update Selector UI active states
  document.querySelectorAll('.ex-option-card').forEach(card => card.classList.remove('active'));
  document.getElementById(`ex-${type}`).classList.add('active');
  
  // Reset active rep limits
  repRingFill.style.strokeDashoffset = 408.4;

  // Clear auto detected highlight on selector change
  document.querySelectorAll('.ex-option-card').forEach(card => {
    card.classList.remove('auto-detected-highlight');
  });
  
  // Speak the changed exercise
  const names = { auto: "Auto-Detect Mode", curls: "Bicep Curls", squats: "Squats", pushups: "Push-ups" };
  speak(`Active exercise switched to ${names[type]}`);
  coachFeedback(`Mode: ${names[type]}`, true);

  // Re-render the form checklist for the specific exercise
  renderChecklist();
}

function renderChecklist() {
  checklistEl.innerHTML = '';
  const currentEx = activeExercise === 'auto' ? autoExercise : activeExercise;
  if (currentEx === 'curls') {
    checklistEl.innerHTML = `
      <li class="check-item" id="chk-curl-rom">
        <span>Range of Motion</span>
        <span class="check-status-badge" id="badge-curl-rom">EXTEND FULLY</span>
      </li>
      <li class="check-item" id="chk-curl-elbow">
        <span>Elbow Drift</span>
        <span class="check-status-badge" id="badge-curl-elbow">KEEP STILL</span>
      </li>
    `;
  } else if (currentEx === 'squats') {
    checklistEl.innerHTML = `
      <li class="check-item" id="chk-squat-depth">
        <span>Squat Depth</span>
        <span class="check-status-badge" id="badge-squat-depth">PARALLEL</span>
      </li>
      <li class="check-item" id="chk-squat-back">
        <span>Back Posture</span>
        <span class="check-status-badge" id="badge-squat-back">KEEP UPRIGHT</span>
      </li>
    `;
  } else if (currentEx === 'pushups') {
    checklistEl.innerHTML = `
      <li class="check-item" id="chk-push-depth">
        <span>Lowering Depth</span>
        <span class="check-status-badge" id="badge-push-depth">CHEST LOW</span>
      </li>
      <li class="check-item" id="chk-push-hips">
        <span>Hips Alignment</span>
        <span class="check-status-badge" id="badge-push-hips">STRAIGHT LINE</span>
      </li>
    `;
  }
}

// ===== CAMERA SETUP AND ENGINE =====
function initializeCamera() {
  setupBtn.disabled = true;
  setupTitle.textContent = "Loading AI Models...";
  setupDesc.textContent = "Please wait, fetching MediaPipe Pose detection engine. This might take a few seconds on first launch...";
  setupEmoji.textContent = "⚙️";
  setupEmoji.className = "spinner";

  // Initialize Pose model
  pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
  });

  pose.setOptions({
    modelComplexity: 2, // Upgrade to Heavy model for maximum joint detection precision
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5, // Slightly lower threshold to avoid dropping trackers during fast movements
    minTrackingConfidence: 0.5
  });

  pose.onResults(onResults);

  // Set up Webcam Stream
  camera = new Camera(rawVideo, {
    onFrame: async () => {
      if (!isSessionPaused && isCameraActive) {
        await pose.send({ image: rawVideo });
      }
    },
    width: 640,
    height: 480
  });

  camera.start()
    .then(() => {
      // Hide setup panel and start session clock
      isCameraActive = true;
      setupPanel.style.display = 'none';
      pauseBtn.style.display = 'block';
      finishBtn.style.display = 'block';
      
      sessionStart = Date.now();
      clockInterval = setInterval(updateClock, 1000);
      
      speak("Trainer camera is ready! Stand in view of the camera to begin.");
      coachFeedback("Webcam Connected!", true);
      renderChecklist();
      initCoachCanvas();
    })
    .catch(err => {
      console.error(err);
      setupTitle.textContent = "Webcam Access Denied";
      setupDesc.textContent = "Unable to start session. Please verify that webcam permissions are granted and no other application is using the camera.";
      setupEmoji.textContent = "❌";
      setupEmoji.className = "setup-icon";
      setupBtn.disabled = false;
      setupBtn.textContent = "Retry Setup";
    });
}

function updateClock() {
  if (isSessionPaused) return;
  elapsedSeconds = Math.floor((Date.now() - sessionStart) / 1000);
  const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const s = String(elapsedSeconds % 60).padStart(2, '0');
  sessionClockEl.textContent = m + ':' + s;
}

function togglePause() {
  isSessionPaused = !isSessionPaused;
  if (isSessionPaused) {
    pauseBtn.textContent = "▶ Resume Session";
    pauseBtn.className = "session-btn btn-pause active-preset";
    speak("Workout paused.");
  } else {
    pauseBtn.textContent = "⏸ Pause Session";
    pauseBtn.className = "session-btn btn-pause";
    speak("Workout resumed.");
  }
}

// Canvas Size Matching
function matchCanvasSize(videoWidth, videoHeight) {
  if (canvasElement.width !== canvasElement.parentElement.clientWidth || 
      canvasElement.height !== canvasElement.parentElement.clientHeight) {
    canvasElement.width = canvasElement.parentElement.clientWidth;
    canvasElement.height = canvasElement.parentElement.clientHeight;
  }
}

// ===== REAL-TIME POSTURE PROCESSING AND SKELETON RENDER =====
function onResults(results) {
  if (isSessionPaused) return;

  const w = canvasElement.clientWidth;
  const h = canvasElement.clientHeight;
  matchCanvasSize(results.image.width, results.image.height);

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw Mirrored Video Frame
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.restore();

  // Draw Pose Skeleton & Compute Angles
  if (results.poseLandmarks) {
    // 1. Gather all required joints mapped to mirrored canvas coordinates (for UI overlay drawing)
    const landmarks = {};
    const indices = {
      nose: 0,
      leftShoulder: 11, rightShoulder: 12,
      leftElbow: 13, rightElbow: 14,
      leftWrist: 15, rightWrist: 16,
      leftHip: 23, rightHip: 24,
      leftKnee: 25, rightKnee: 26,
      leftAnkle: 27, rightAnkle: 28
    };

    for (const name in indices) {
      const idx = indices[name];
      const pt = results.poseLandmarks[idx];
      if (pt && pt.visibility > 0.5) {
        landmarks[name] = getCanvasCoords(pt, canvasElement.width, canvasElement.height);
      }
    }

    // 2. Gather 3D metric world landmarks for physical joint angle calculations (immune to camera skew/aspect stretching)
    const worldLandmarks = {};
    if (results.poseWorldLandmarks) {
      for (const name in indices) {
        const idx = indices[name];
        const pt = results.poseWorldLandmarks[idx];
        if (pt && pt.visibility > 0.5) {
          worldLandmarks[name] = pt;
        }
      }
    }

    // Draw basic skeleton joints connection lines
    drawSkeletonBones(canvasCtx, landmarks);

    // 3. Perform exercise specific evaluations
    let runEx = activeExercise;
    if (activeExercise === 'auto') {
      const detected = detectExercise(landmarks, worldLandmarks);
      if (detected && detected !== autoExercise) {
        autoExercise = detected;
        speak(`Detected ${detected === 'curls' ? 'Bicep Curls' : (detected === 'squats' ? 'Squats' : 'Push-ups')}`);
        renderChecklist();
      }
      updateAutoDetectedUI(autoExercise);
      runEx = autoExercise;
    }

    if (runEx === 'curls') {
      evaluateCurls(landmarks, worldLandmarks);
    } else if (runEx === 'squats') {
      evaluateSquats(landmarks, worldLandmarks);
    } else if (runEx === 'pushups') {
      evaluatePushups(landmarks, worldLandmarks);
    }
  }
}

// Draw skeleton bones
function drawSkeletonBones(ctx, lm) {
  // Skeleton configuration links
  const segments = [
    [lm.leftShoulder, lm.rightShoulder],
    [lm.leftShoulder, lm.leftHip],
    [lm.rightShoulder, lm.rightHip],
    [lm.leftHip, lm.rightHip],
    [lm.leftHip, lm.leftKnee],
    [lm.leftKnee, lm.leftAnkle],
    [lm.rightHip, lm.rightKnee],
    [lm.rightKnee, lm.rightAnkle]
  ];

  segments.forEach(seg => {
    if (seg[0] && seg[1]) {
      drawSegment(ctx, seg[0], seg[1], colors.skeleton, 2);
    }
  });

  // Draw joints as white dots
  for (const name in lm) {
    drawJointCircle(ctx, lm[name], colors.skeletonJoint, 5);
  }
}

function drawSegment(ctx, p1, p2, color, width = 4) {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawJointCircle(ctx, p, color, radius = 5) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
}

function drawTextOnJoint(ctx, text, p, color = '#ffffff') {
  ctx.save();
  ctx.font = 'bold 15px Inter, system-ui, sans-serif';
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 6;
  ctx.fillText(text, p.x + 15, p.y + 5);
  ctx.restore();
}

// ===== INDIVIDUAL EXERCISE CALCULATIONS =====

// 1. Evaluate Bicep Curls
function evaluateCurls(lm, wl) {
  const leftVisible = lm.leftShoulder && lm.leftElbow && lm.leftWrist && wl.leftShoulder && wl.leftElbow && wl.leftWrist;
  const rightVisible = lm.rightShoulder && lm.rightElbow && lm.rightWrist && wl.rightShoulder && wl.rightElbow && wl.rightWrist;
  
  if (!leftVisible && !rightVisible) {
    coachFeedback("Position your arms in front of the camera");
    return;
  }

  let leftAngle = 180;
  let rightAngle = 180;

  let leftDrift = 0;
  let rightDrift = 0;

  // Process Left Arm
  if (leftVisible) {
    leftAngle = calculate3DAngle(wl.leftShoulder, wl.leftElbow, wl.leftWrist);
    // Measure elbow swing angle using Hip-Shoulder-Elbow
    if (wl.leftHip) {
      leftDrift = calculate3DAngle(wl.leftHip, wl.leftShoulder, wl.leftElbow);
    }
    
    // Draw left arm overlay segment
    const cArm = leftAngle < 50 || leftAngle > 140 ? colors.accent : colors.primary;
    drawSegment(canvasCtx, lm.leftShoulder, lm.leftElbow, cArm, 4);
    drawSegment(canvasCtx, lm.leftElbow, lm.leftWrist, cArm, 4);
    drawTextOnJoint(canvasCtx, `${Math.round(leftAngle)}°`, lm.leftElbow, leftAngle < 50 ? colors.accent : '#fff');

    // Run state transitions
    processCurlArm('left', leftAngle, leftDrift);
  }

  // Process Right Arm
  if (rightVisible) {
    rightAngle = calculate3DAngle(wl.rightShoulder, wl.rightElbow, wl.rightWrist);
    if (wl.rightHip) {
      rightDrift = calculate3DAngle(wl.rightHip, wl.rightShoulder, wl.rightElbow);
    }

    // Draw right arm overlay segment
    const cArm = rightAngle < 50 || rightAngle > 140 ? colors.accent : colors.primary;
    drawSegment(canvasCtx, lm.rightShoulder, lm.rightElbow, cArm, 4);
    drawSegment(canvasCtx, lm.rightElbow, lm.rightWrist, cArm, 4);
    drawTextOnJoint(canvasCtx, `${Math.round(rightAngle)}°`, lm.rightElbow, rightAngle < 50 ? colors.accent : '#fff');

    // Run state transitions
    processCurlArm('right', rightAngle, rightDrift);
  }

  // Update real-time checklist UI
  updateCurlChecklist(leftVisible ? leftDrift : rightDrift);
}

function processCurlArm(side, angle, drift) {
  const armState = repStates.curls[side];
  
  // Track range limits during current rep movement
  if (angle < repStates.curls[`${side}MinAngle`]) {
    repStates.curls[`${side}MinAngle`] = angle;
  }
  if (angle > repStates.curls[`${side}MaxAngle`]) {
    repStates.curls[`${side}MaxAngle`] = angle;
  }

  // State transitions: down -> up -> down (one rep)
  if (armState === 'down') {
    // Flexion (Contract)
    if (angle < 45) {
      repStates.curls[side] = 'up';
      repStates.curls[`${side}MaxAngle`] = 0; // reset for extension path
      
      // Form check during lift:
      if (drift > 28) {
        coachFeedback("Keep elbows locked close to your body!");
        currentForm.curls.elbowTucked = false;
      } else {
        coachFeedback("Good compression!", true);
        currentForm.curls.elbowTucked = true;
      }
    }
  } else if (armState === 'up') {
    // Extension (Lower)
    if (angle > 145) {
      repStates.curls[side] = 'down';
      
      // Completed rep evaluation
      totalAttempts++;
      const minReached = repStates.curls[`${side}MinAngle`];
      const maxReached = repStates.curls[`${side}MaxAngle`];
      
      let isRepValid = true;
      
      // ROM Check
      if (minReached > 60) {
        coachFeedback("Curl all the way up to squeeze your biceps!");
        isRepValid = false;
        currentForm.curls.fullExtension = false;
      } else if (maxReached < 160) {
        coachFeedback("Extend your arms fully to 180 degrees at the bottom!");
        isRepValid = false;
        currentForm.curls.fullExtension = false;
      } else {
        currentForm.curls.fullExtension = true;
      }

      if (drift > 28) isRepValid = false;

      // Update counts
      repCount++;
      sessionStats.curls++;
      if (isRepValid) {
        validReps++;
        playBeep();
        coachFeedback("Perfect Curl rep!", true);
      }
      
      // Reset limits
      repStates.curls[`${side}MinAngle`] = 180;
      repStates.curls[`${side}MaxAngle`] = 0;
      
      updateStatsUI();
    }
  }

  // Display flexion progress in radial ring (0 to 100%)
  // Range is ~150 (down) to ~40 (up)
  const range = 150 - 45;
  const currentFlex = Math.max(0, Math.min(1, (150 - angle) / range));
  updateRepRing(currentFlex);
}

function updateCurlChecklist(drift) {
  const romItem = document.getElementById('chk-curl-rom');
  const elbowItem = document.getElementById('chk-curl-elbow');
  
  const romBadge = document.getElementById('badge-curl-rom');
  const elbowBadge = document.getElementById('badge-curl-elbow');

  // Elbow drift checklist
  if (drift > 28) {
    elbowItem.className = 'check-item error';
    elbowBadge.textContent = 'SWINGING';
  } else {
    elbowItem.className = 'check-item correct';
    elbowBadge.textContent = 'STABLE';
  }

  // ROM checklist
  if (currentForm.curls.fullExtension) {
    romItem.className = 'check-item correct';
    romBadge.textContent = 'FULL ROM';
  } else {
    romItem.className = 'check-item error';
    romBadge.textContent = 'SHORT ROM';
  }
}

// 2. Evaluate Squats
function evaluateSquats(lm, wl) {
  const hasBody = lm.leftHip && lm.leftKnee && lm.leftAnkle && lm.leftShoulder &&
                  wl.leftHip && wl.leftKnee && wl.leftAnkle && wl.leftShoulder;
  if (!hasBody) {
    coachFeedback("Step back to show your full body in the screen");
    return;
  }

  // Calculate knee angle using 3D world landmarks
  const kneeAngle = calculate3DAngle(wl.leftHip, wl.leftKnee, wl.leftAnkle);
  
  // Torso tilt angle (Chest relative to thigh line) using 3D world landmarks
  const hipAngle = calculate3DAngle(wl.leftShoulder, wl.leftHip, wl.leftKnee);

  // Draw overlay skeleton highlights
  const cSquat = kneeAngle < 105 ? colors.accent : colors.primary;
  drawSegment(canvasCtx, lm.leftHip, lm.leftKnee, cSquat, 4);
  drawSegment(canvasCtx, lm.leftKnee, lm.leftAnkle, cSquat, 4);
  drawSegment(canvasCtx, lm.leftShoulder, lm.leftHip, cSquat, 4);

  drawTextOnJoint(canvasCtx, `${Math.round(kneeAngle)}° Knee`, lm.leftKnee, kneeAngle < 105 ? colors.accent : '#fff');
  drawTextOnJoint(canvasCtx, `${Math.round(hipAngle)}° Back`, lm.leftHip, hipAngle < 75 ? colors.danger : '#fff');

  // Track minimum angle reached in squat
  if (kneeAngle < repStates.squats.minAngle) {
    repStates.squats.minAngle = kneeAngle;
  }

  // State transitions: up -> down -> up (one rep)
  const squatState = repStates.squats.state;
  if (squatState === 'up') {
    if (kneeAngle < 115) {
      repStates.squats.state = 'down';
      repStates.squats.isTorsoGood = true; // reset
    }
  } else if (squatState === 'down') {
    // Form check: check back bending
    if (hipAngle < 70) {
      repStates.squats.isTorsoGood = false;
      coachFeedback("Keep your back straight! Press your chest up and shoulders back.");
    }

    // Standing back up
    if (kneeAngle > 155) {
      repStates.squats.state = 'up';
      totalAttempts++;

      let isRepValid = true;
      const deepestKnee = repStates.squats.minAngle;

      // Squat Depth Check
      if (deepestKnee > 105) {
        coachFeedback("Go lower! Aim for thighs parallel to ground (knees at a 90-degree angle).");
        isRepValid = false;
        currentForm.squats.depthGood = false;
      } else {
        currentForm.squats.depthGood = true;
      }

      // Torso angle validation
      if (!repStates.squats.isTorsoGood) {
        isRepValid = false;
        currentForm.squats.backStraight = false;
      } else {
        currentForm.squats.backStraight = true;
      }

      repCount++;
      sessionStats.squats++;
      if (isRepValid) {
        validReps++;
        playBeep();
        coachFeedback("Excellent Squat depth!", true);
      }

      // Reset limits
      repStates.squats.minAngle = 180;
      updateStatsUI();
    }
  }

  // Progress radial fill: standard standing (170) to parallel squat (90)
  const squatRange = 170 - 90;
  const currentDepth = Math.max(0, Math.min(1, (170 - kneeAngle) / squatRange));
  updateRepRing(currentDepth);

  // Update Checklist
  updateSquatChecklist(kneeAngle, hipAngle);
}

function updateSquatChecklist(kneeAngle, hipAngle) {
  const depthItem = document.getElementById('chk-squat-depth');
  const backItem = document.getElementById('chk-squat-back');
  const depthBadge = document.getElementById('badge-squat-depth');
  const backBadge = document.getElementById('badge-squat-back');

  // Back posture
  if (hipAngle < 70) {
    backItem.className = 'check-item error';
    backBadge.textContent = 'LEANING FORWARD';
  } else {
    backItem.className = 'check-item correct';
    backBadge.textContent = 'UPRIGHT';
  }

  // Squat Depth
  if (kneeAngle < 105) {
    depthItem.className = 'check-item correct';
    depthBadge.textContent = 'DEEP';
  } else {
    depthItem.className = 'check-item';
    depthBadge.textContent = 'GO LOWER';
  }
}

// 3. Evaluate Pushups
function evaluatePushups(lm, wl) {
  const hasPushupBody = lm.leftShoulder && lm.leftElbow && lm.leftWrist && lm.leftHip && lm.leftAnkle &&
                        wl.leftShoulder && wl.leftElbow && wl.leftWrist && wl.leftHip && wl.leftAnkle;
  if (!hasPushupBody) {
    coachFeedback("Position your entire body sideways to camera");
    return;
  }

  // Calculate elbow angle using 3D world landmarks
  const elbowAngle = calculate3DAngle(wl.leftShoulder, wl.leftElbow, wl.leftWrist);
  
  // Body alignment angle (should be close to 180 degrees) using 3D world landmarks
  const hipAlignmentAngle = calculate3DAngle(wl.leftShoulder, wl.leftHip, wl.leftAnkle);

  // Draw overlay skeleton lines
  const cPush = elbowAngle < 100 ? colors.accent : colors.primary;
  drawSegment(canvasCtx, lm.leftShoulder, lm.leftElbow, cPush, 4);
  drawSegment(canvasCtx, lm.leftElbow, lm.leftWrist, cPush, 4);
  drawSegment(canvasCtx, lm.leftShoulder, lm.leftHip, cPush, 4);
  drawSegment(canvasCtx, lm.leftHip, lm.leftAnkle, cPush, 4);

  drawTextOnJoint(canvasCtx, `${Math.round(elbowAngle)}° Elbow`, lm.leftElbow, elbowAngle < 100 ? colors.accent : '#fff');
  drawTextOnJoint(canvasCtx, `${Math.round(hipAlignmentAngle)}° Hip`, lm.leftHip, 
                  (hipAlignmentAngle < 162 || hipAlignmentAngle > 198) ? colors.danger : '#fff');

  // Track min angle (deepest point)
  if (elbowAngle < repStates.pushups.minAngle) {
    repStates.pushups.minAngle = elbowAngle;
  }

  // State transitions: up -> down -> up (one rep)
  const pushState = repStates.pushups.state;
  if (pushState === 'up') {
    if (elbowAngle < 110) {
      repStates.pushups.state = 'down';
      repStates.pushups.isBodyLineGood = true; // reset
    }
  } else if (pushState === 'down') {
    // Form check: check hip alignment
    if (hipAlignmentAngle < 162 || hipAlignmentAngle > 198) {
      repStates.pushups.isBodyLineGood = false;
      coachFeedback("Keep your core braced! Shoulders, hips, and ankles should form a straight line.");
    }

    // Push back up
    if (elbowAngle > 150) {
      repStates.pushups.state = 'up';
      totalAttempts++;

      let isRepValid = true;
      const deepestElbow = repStates.pushups.minAngle;

      // Depth check
      if (deepestElbow > 100) {
        coachFeedback("Lower your chest! Aim for elbows at a 90-degree angle with the floor.");
        isRepValid = false;
        currentForm.pushups.depthGood = false;
      } else {
        currentForm.pushups.depthGood = true;
      }

      // Hip alignment check
      if (!repStates.pushups.isBodyLineGood) {
        isRepValid = false;
        currentForm.pushups.bodyStraight = false;
      } else {
        currentForm.pushups.bodyStraight = true;
      }

      repCount++;
      sessionStats.pushups++;
      if (isRepValid) {
        validReps++;
        playBeep();
        coachFeedback("Solid pushup form!", true);
      }

      // Reset limits
      repStates.pushups.minAngle = 180;
      updateStatsUI();
    }
  }

  // Progress radial fill: standard plank (160) to low pushup (90)
  const pushRange = 160 - 90;
  const currentProgress = Math.max(0, Math.min(1, (160 - elbowAngle) / pushRange));
  updateRepRing(currentProgress);

  // Update Checklist
  updatePushupChecklist(elbowAngle, hipAlignmentAngle);
}

function updatePushupChecklist(elbowAngle, hipAngle) {
  const depthItem = document.getElementById('chk-push-depth');
  const hipsItem = document.getElementById('chk-push-hips');
  const depthBadge = document.getElementById('badge-push-depth');
  const hipsBadge = document.getElementById('badge-push-hips');

  // Hips alignment
  if (hipAngle < 162 || hipAngle > 198) {
    hipsItem.className = 'check-item error';
    hipsBadge.textContent = 'SAGGING/ARCHED';
  } else {
    hipsItem.className = 'check-item correct';
    hipsBadge.textContent = 'STRAIGHT';
  }

  // Pushup depth
  if (elbowAngle < 100) {
    depthItem.className = 'check-item correct';
    depthBadge.textContent = 'GOOD DEPTH';
  } else {
    depthItem.className = 'check-item';
    depthBadge.textContent = 'LOWER MORE';
  }
}

// ===== SESSION COMPLETION AND SUMMARY SAVE =====
function finishSession() {
  if (repCount === 0) {
    speak("Workout session cancelled. No reps were logged.");
    window.location.href = 'index.html';
    return;
  }

  // Pause calculations
  isSessionPaused = true;
  clearInterval(clockInterval);

  // Populate Modal Summary values
  const exNames = [];
  if (sessionStats.curls > 0) exNames.push('Curls');
  if (sessionStats.squats > 0) exNames.push('Squats');
  if (sessionStats.pushups > 0) exNames.push('Pushups');
  
  sumExercise.textContent = exNames.length > 0 ? exNames.join(' + ') : 'None';
  sumReps.textContent = repCount;
  
  let score = 100;
  if (totalAttempts > 0) {
    score = Math.round((validReps / totalAttempts) * 100);
  }
  sumAccuracy.textContent = score + '%';
  
  // Total calories burned
  let calTotal = 0;
  calTotal += sessionStats.curls * 0.8;
  calTotal += sessionStats.squats * 1.5;
  calTotal += sessionStats.pushups * 1.2;
  sumCalories.textContent = Math.round(calTotal) + ' kcal';

  speak(`Workout session complete. You finished ${repCount} repetitions with an average form accuracy of ${score} percent.`);
  
  // Show Modal
  summaryModal.classList.add('show');
}

function discardSession() {
  if (confirm("Are you sure you want to discard this workout session? It won't be saved to your dashboard.")) {
    window.location.href = 'index.html';
  } else {
    // Resume
    isSessionPaused = false;
    sessionStart = Date.now() - (elapsedSeconds * 1000);
    clockInterval = setInterval(updateClock, 1000);
    summaryModal.classList.remove('show');
  }
}

function saveSession() {
  // 1. Structure the exercises logged
  const loggedExercises = [];
  for (const key in sessionStats) {
    if (sessionStats[key] > 0) {
      const name = key === 'curls' ? 'Bicep Curls' : (key === 'squats' ? 'Squats' : 'Pushups');
      const reps = sessionStats[key];
      const sets = Math.max(1, Math.ceil(reps / 10)); // assume sets of 10
      const weight = key === 'curls' ? 10 : 0;
      loggedExercises.push({
        name: name,
        sets: `${sets}/${sets}`,
        reps: reps,
        weight: weight
      });
    }
  }

  if (loggedExercises.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  // Calculate session volume & sets
  const totalSets = loggedExercises.reduce((acc, ex) => acc + parseInt(ex.sets.split('/')[0]), 0);
  const totalVol = loggedExercises.reduce((acc, ex) => acc + (ex.reps * ex.weight), 0);

  // 2. Create the workout history log
  const sessionLog = {
    date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    duration: `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`,
    exercises: loggedExercises,
    totalSets: totalSets,
    totalVolume: Math.round(totalVol)
  };

  // 3. Save to history
  const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
  history.unshift(sessionLog);
  if (history.length > 30) history.pop();
  localStorage.setItem('workoutHistory', JSON.stringify(history));

  // 4. Force trigger the streak update logic from goals.js
  // (We replicate the activity trigger by ensuring calsBurned is recalculated)
  const streakKey = "thawman_streak_data";
  const todayStr = new Date().toDateString();
  let streakData = JSON.parse(localStorage.getItem(streakKey) || JSON.stringify({
    currentStreak: 0,
    lastActiveDate: "",
    daysLogged: []
  }));

  if (!streakData.daysLogged.includes(todayStr)) {
    streakData.daysLogged.push(todayStr);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (streakData.lastActiveDate === yesterdayStr) {
      streakData.currentStreak += 1;
    } else if (streakData.lastActiveDate !== todayStr) {
      streakData.currentStreak = 1;
    }
    streakData.lastActiveDate = todayStr;
    localStorage.setItem(streakKey, JSON.stringify(streakData));
  }

  alert("💪 Workout saved! Directing you back to your Dashboard.");
  window.location.href = 'index.html';
}

// Initialise Checklist items & Coach companion
renderChecklist();
updateStatsUI();
initCoachCanvas();
animateCoach();

// Resize handler to adjust coach canvas dynamically
window.addEventListener('resize', initCoachCanvas);

// CBum Preloaded Coach Image
const cbumImg = new Image();
cbumImg.src = 'cbum.jpg';

// CBum Quotes & Animation Cycle States
const coachQuotes = [
  "YEAH BUDDY! Light weight!",
  "Squeeze it at the top!",
  "Control the negative, buddy!",
  "Thighs parallel, push through!",
  "Brace that core, straight line!",
  "Another rep, let's go!",
  "Perfect form, no shortcuts!",
  "Stay focused, you got this!"
];
let activeQuote = "";
let quoteExpireTime = 0;
let lastPeak = false;

function initCoachCanvas() {
  if (!coachCanvas) return;
  const rect = coachCanvas.getBoundingClientRect();
  const parentRect = coachCanvas.parentElement ? coachCanvas.parentElement.getBoundingClientRect() : {};
  let w = coachCanvas.clientWidth || rect.width || parentRect.width || 380;
  let h = coachCanvas.clientHeight || rect.height || parentRect.height || 300;
  if (w < 100) w = 380;
  if (h < 100) h = 300;
  coachCanvas.width = w;
  coachCanvas.height = h;
}

function drawGridBackground(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  const gridSize = 25;
  
  // Vertical lines
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCoachBones(ctx, j, exercise) {
  ctx.save();
  ctx.strokeStyle = "rgba(124, 58, 237, 0.5)"; // purple glowing skeleton
  ctx.lineWidth = 5;
  ctx.lineCap = "round";

  const connections = [];

  if (exercise === 'curls') {
    connections.push([j.shoulder, j.elbow]);
    connections.push([j.elbow, j.wrist]);
    connections.push([j.shoulder, j.hip]);
    connections.push([j.hip, j.ankle]);
  } else if (exercise === 'squats') {
    connections.push([j.shoulder, j.hip]);
    connections.push([j.hip, j.knee]);
    connections.push([j.knee, j.ankle]);
    connections.push([j.shoulder, j.elbow]);
    connections.push([j.elbow, j.wrist]);
  } else if (exercise === 'pushups') {
    connections.push([j.shoulder, j.hip]);
    connections.push([j.hip, j.ankle]);
    connections.push([j.shoulder, j.elbow]);
    connections.push([j.elbow, j.wrist]);
  }

  connections.forEach(conn => {
    if (conn[0] && conn[1]) {
      ctx.beginPath();
      ctx.moveTo(conn[0].x, conn[0].y);
      ctx.lineTo(conn[1].x, conn[1].y);
      ctx.stroke();
    }
  });

  // Bulging muscles
  ctx.fillStyle = "rgba(74, 222, 128, 0.25)"; // green highlights
  ctx.strokeStyle = "rgba(74, 222, 128, 0.6)";
  ctx.lineWidth = 2;

  if (exercise === 'curls' && j.shoulder && j.elbow && j.wrist) {
    // Bicep bulge calculation
    const midX = (j.shoulder.x + j.elbow.x) / 2;
    const midY = (j.shoulder.y + j.elbow.y) / 2;
    
    const curlProgress = Math.max(0, Math.min(1, (j.elbow.y - j.wrist.y + 40) / 100));
    const bulgeWidth = 6 + curlProgress * 14;

    ctx.beginPath();
    ctx.moveTo(j.shoulder.x, j.shoulder.y);
    ctx.quadraticCurveTo(midX + bulgeWidth, midY, j.elbow.x, j.elbow.y);
    ctx.lineTo(j.shoulder.x, j.shoulder.y);
    ctx.fill();
    ctx.stroke();
  } else if (exercise === 'squats' && j.hip && j.knee) {
    // Quad bulge calculation
    const midX = (j.hip.x + j.knee.x) / 2;
    const midY = (j.hip.y + j.knee.y) / 2;
    ctx.beginPath();
    ctx.arc(midX, midY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawCoachJoints(ctx, j) {
  ctx.save();
  for (const key in j) {
    if (key === 'head') continue;
    ctx.beginPath();
    ctx.arc(j[key].x, j[key].y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#4ade80"; // neon green
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawCoachHead(ctx, head) {
  ctx.save();
  const radius = 24;

  ctx.beginPath();
  ctx.arc(head.x, head.y, radius, 0, Math.PI * 2);
  ctx.clip();

  if (cbumImg.complete && cbumImg.naturalWidth !== 0) {
    ctx.drawImage(cbumImg, head.x - radius, head.y - radius, radius * 2, radius * 2);
  } else {
    // Mustache man emoji fallback
    ctx.fillStyle = "#7c3aed";
    ctx.beginPath();
    ctx.arc(head.x, head.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("👨🏻", head.x, head.y + 2);
  }

  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(head.x, head.y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "#4ade80";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "rgba(74, 222, 128, 0.6)";
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.restore();
}

function drawSpeechBubble(ctx, text, x, y) {
  ctx.save();
  ctx.font = "bold 13px Inter, system-ui, sans-serif";
  const metrics = ctx.measureText(text);
  const paddingX = 12;
  const paddingY = 8;
  const width = metrics.width + paddingX * 2;
  const height = 28;
  const rx = x - width / 2;
  const ry = y - height - 15;

  ctx.fillStyle = "rgba(10, 10, 20, 0.95)";
  ctx.strokeStyle = "rgba(74, 222, 128, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(rx, ry, width, height, 8);
  } else {
    ctx.rect(rx, ry, width, height);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(10, 10, 20, 0.95)";
  ctx.beginPath();
  ctx.moveTo(x - 6, ry + height);
  ctx.lineTo(x, ry + height + 6);
  ctx.lineTo(x + 6, ry + height);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#4ade80";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, ry + height / 2);
  ctx.restore();
}

function animateCoach() {
  if (!coachCanvas || !coachCtx) return;
  coachAnimationId = requestAnimationFrame(animateCoach);

  // Self-healing responsive resize check
  const currentWidth = coachCanvas.clientWidth || 380;
  const currentHeight = coachCanvas.clientHeight || 300;
  if (coachCanvas.width !== currentWidth || coachCanvas.height !== currentHeight || coachCanvas.width < 100 || coachCanvas.height < 100) {
    initCoachCanvas();
  }

  if (isSessionPaused) return;

  // Sync animation pace: 1 rep per ~3.5 seconds
  coachCycleTime += 0.03;
  const phase = (Math.sin(coachCycleTime) + 1) / 2;
  
  const currentEx = activeExercise === 'auto' ? autoExercise : activeExercise;
  
  if (coachStatusEl) {
    const statuses = {
      curls: "CURLING (Perfect Form)",
      squats: "SQUATTING (Parallel Depth)",
      pushups: "PUSH-UP (Straight Line)"
    };
    coachStatusEl.textContent = statuses[currentEx] || "Ready...";
  }

  // Speech quote trigger on peak contraction
  const isPeak = Math.sin(coachCycleTime) > 0.97;
  if (isPeak && !lastPeak) {
    if (Math.random() < 0.5) {
      activeQuote = coachQuotes[Math.floor(Math.random() * coachQuotes.length)];
      quoteExpireTime = Date.now() + 2000;
    }
  }
  lastPeak = isPeak;

  coachCtx.clearRect(0, 0, coachCanvas.width, coachCanvas.height);
  drawGridBackground(coachCtx, coachCanvas.width, coachCanvas.height);

  const X = coachCanvas.width / 2;
  const Y = coachCanvas.height / 2;

  let joints = {};

  if (currentEx === 'curls') {
    const start = {
      head: { x: X, y: Y - 110 },
      shoulder: { x: X, y: Y - 60 },
      elbow: { x: X - 5, y: Y + 10 },
      wrist: { x: X + 10, y: Y + 75 },
      hip: { x: X - 15, y: Y + 50 },
      ankle: { x: X - 15, y: Y + 130 }
    };
    const end = {
      head: { x: X, y: Y - 110 },
      shoulder: { x: X, y: Y - 60 },
      elbow: { x: X - 10, y: Y + 10 },
      wrist: { x: X + 15, y: Y - 40 },
      hip: { x: X - 15, y: Y + 50 },
      ankle: { x: X - 15, y: Y + 130 }
    };

    for (const key in start) {
      joints[key] = {
        x: start[key].x + (end[key].x - start[key].x) * phase,
        y: start[key].y + (end[key].y - start[key].y) * phase
      };
    }

    drawCoachBones(coachCtx, joints, currentEx);
    drawCoachJoints(coachCtx, joints);

    const currentAngle = Math.round(165 - 125 * phase);
    drawTextOnJoint(coachCtx, `${currentAngle}° Elbow`, joints.elbow, '#4ade80');
    
    coachCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
    coachCtx.font = "11px Inter, sans-serif";
    coachCtx.fillText("Target Top: 40°", X + 35, Y - 30);
    coachCtx.fillText("Target Bottom: 165°+", X + 35, Y + 85);

  } else if (currentEx === 'squats') {
    const start = {
      head: { x: X - 45, y: Y - 120 },
      shoulder: { x: X - 40, y: Y - 90 },
      elbow: { x: X - 25, y: Y - 70 },
      wrist: { x: X - 10, y: Y - 70 },
      hip: { x: X - 40, y: Y - 5 },
      knee: { x: X - 40, y: Y + 65 },
      ankle: { x: X - 40, y: Y + 135 }
    };
    const end = {
      head: { x: X - 40, y: Y - 45 },
      shoulder: { x: X - 35, y: Y - 15 },
      elbow: { x: X - 10, y: Y - 5 },
      wrist: { x: X + 10, y: Y - 5 },
      hip: { x: X - 70, y: Y + 60 },
      knee: { x: X - 5, y: Y + 65 },
      ankle: { x: X - 40, y: Y + 135 }
    };

    for (const key in start) {
      joints[key] = {
        x: start[key].x + (end[key].x - start[key].x) * phase,
        y: start[key].y + (end[key].y - start[key].y) * phase
      };
    }

    drawCoachBones(coachCtx, joints, currentEx);
    drawCoachJoints(coachCtx, joints);

    const currentKneeAngle = Math.round(170 - 75 * phase);
    const currentHipAngle = Math.round(110 - 35 * phase);
    drawTextOnJoint(coachCtx, `${currentKneeAngle}° Knee`, joints.knee, '#4ade80');
    drawTextOnJoint(coachCtx, `${currentHipAngle}° Back`, joints.hip, '#4ade80');

    coachCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
    coachCtx.font = "11px Inter, sans-serif";
    coachCtx.fillText("Target Knee: 95°", X + 20, Y + 85);
    coachCtx.fillText("Target Back: Upright", X - 100, Y - 70);

  } else if (currentEx === 'pushups') {
    const start = {
      head: { x: X + 75, y: Y - 10 },
      shoulder: { x: X + 50, y: Y },
      elbow: { x: X + 35, y: Y - 25 },
      wrist: { x: X + 50, y: Y + 35 },
      hip: { x: X - 20, y: Y + 25 },
      ankle: { x: X - 90, y: Y + 50 }
    };
    const end = {
      head: { x: X + 75, y: Y + 25 },
      shoulder: { x: X + 50, y: Y + 35 },
      elbow: { x: X + 80, y: Y + 45 },
      wrist: { x: X + 50, y: Y + 35 },
      hip: { x: X - 20, y: Y + 60 },
      ankle: { x: X - 90, y: Y + 85 }
    };

    for (const key in start) {
      joints[key] = {
        x: start[key].x + (end[key].x - start[key].x) * phase,
        y: start[key].y + (end[key].y - start[key].y) * phase
      };
    }

    drawCoachBones(coachCtx, joints, currentEx);
    drawCoachJoints(coachCtx, joints);

    const currentElbowAngle = Math.round(160 - 70 * phase);
    drawTextOnJoint(coachCtx, `${currentElbowAngle}° Elbow`, joints.elbow, '#4ade80');
    drawTextOnJoint(coachCtx, `180° Hip (Straight)`, joints.hip, '#4ade80');

    coachCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
    coachCtx.font = "11px Inter, sans-serif";
    coachCtx.fillText("Target Elbow: 90°", X + 80, Y + 90);
    coachCtx.fillText("Plank Alignment: 180°", X - 100, Y - 30);
  }

  if (joints.head) {
    drawCoachHead(coachCtx, joints.head);
  }

  if (activeQuote && Date.now() < quoteExpireTime && joints.head) {
    drawSpeechBubble(coachCtx, activeQuote, joints.head.x, joints.head.y);
  } else {
    activeQuote = "";
  }
}
