const state = {
  workers: [],
  distribution: [],
  selectedId: null,
  particles: [],
  lastTick: performance.now(),
  toastTimer: null,
};

const elements = {
  form: document.querySelector('#createForm'),
  dbName: document.querySelector('#dbName'),
  numWorkers: document.querySelector('#numWorkers'),
  duration: document.querySelector('#duration'),
  workerList: document.querySelector('#workerList'),
  distributionList: document.querySelector('#distributionList'),
  connectionStatus: document.querySelector('#connectionStatus'),
  totalWorkers: document.querySelector('#totalWorkers'),
  runningManagers: document.querySelector('#runningManagers'),
  sampleTotal: document.querySelector('#sampleTotal'),
  selectedTitle: document.querySelector('#selectedTitle'),
  selectedMeta: document.querySelector('#selectedMeta'),
  startButton: document.querySelector('#startButton'),
  stopButton: document.querySelector('#stopButton'),
  cleanButton: document.querySelector('#cleanButton'),
  deleteButton: document.querySelector('#deleteButton'),
  refreshButton: document.querySelector('#refreshButton'),
  activeManagers: document.querySelector('#activeManagers'),
  elapsedTime: document.querySelector('#elapsedTime'),
  activeDatabase: document.querySelector('#activeDatabase'),
  distributionLabel: document.querySelector('#distributionLabel'),
  toast: document.querySelector('#toast'),
  canvas: document.querySelector('#loadCanvas'),
};

const ctx = elements.canvas.getContext('2d');

elements.form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    dbName: elements.dbName.value,
    numWorkers: Number(elements.numWorkers.value),
    duration: Number(elements.duration.value),
  };

  try {
    const result = await request('/api/worker', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    state.selectedId = result.workerManagerId;
    showToast('테스트가 생성되었습니다.');
    await refreshAll();
  } catch (error) {
    showToast(error.message);
  }
});

elements.refreshButton.addEventListener('click', () => {
  refreshAll().catch((error) => showToast(error.message));
});

elements.startButton.addEventListener('click', () => runSelectedAction('/api/worker/start', 'PUT', '테스트를 시작했습니다.'));
elements.stopButton.addEventListener('click', () => runSelectedAction('/api/worker/stop', 'PUT', '테스트를 중지했습니다.'));
elements.cleanButton.addEventListener('click', () => runSelectedAction('/api/worker/clean', 'PUT', '테스트 데이터를 정리합니다.'));
elements.deleteButton.addEventListener('click', () => runSelectedAction('/api/worker', 'DELETE', '테스트를 삭제했습니다.'));

window.addEventListener('resize', resizeCanvas);

async function runSelectedAction(path, method, message) {
  const selected = getSelectedWorker();
  if (!selected) {
    showToast('먼저 테스트를 선택해주세요.');
    return;
  }

  try {
    await request(path, {
      method,
      body: JSON.stringify({ workerManagerId: selected.id }),
    });

    if (method === 'DELETE') {
      state.selectedId = null;
    }

    showToast(message);
    await refreshAll();
  } catch (error) {
    showToast(error.message);
  }
}

async function refreshAll() {
  const selectedDb = getSelectedWorker()?.dbName || elements.dbName.value || 'postgres';

  const [workersResult, distributionResult] = await Promise.allSettled([
    request('/api/worker'),
    request(`/api/database/${encodeURIComponent(selectedDb)}`),
  ]);

  if (workersResult.status === 'fulfilled') {
    state.workers = Array.isArray(workersResult.value) ? workersResult.value : [];
    elements.connectionStatus.textContent = 'API 연결됨';
  } else {
    elements.connectionStatus.textContent = 'API 연결 실패';
    throw workersResult.reason;
  }

  if (distributionResult.status === 'fulfilled') {
    state.distribution = Array.isArray(distributionResult.value) ? distributionResult.value : [];
  } else {
    state.distribution = [];
  }

  if (state.selectedId && !state.workers.some((worker) => worker.id === state.selectedId)) {
    state.selectedId = state.workers[0]?.id || null;
  }

  render();
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }

  return data;
}

function render() {
  renderSummary();
  renderSelected();
  renderWorkerList();
  renderDistribution();
}

function renderSummary() {
  const running = state.workers.filter((worker) => worker.status === 'running');
  const totalWorkerCount = state.workers.reduce((total, worker) => total + worker.numWorkers, 0);
  const sampleTotal = state.distribution.reduce((total, item) => total + item.count, 0);
  const selected = getSelectedWorker();

  elements.totalWorkers.textContent = String(totalWorkerCount);
  elements.runningManagers.textContent = String(running.length);
  elements.sampleTotal.textContent = formatNumber(sampleTotal);
  elements.activeManagers.textContent = String(running.length);
  elements.elapsedTime.textContent = selected ? formatDuration(selected.elapsedTime) : '0s';
  elements.activeDatabase.textContent = selected?.dbName || elements.dbName.value;
}

function renderSelected() {
  const selected = getSelectedWorker();
  const hasSelected = Boolean(selected);

  elements.selectedTitle.textContent = selected ? shortId(selected.id) : 'None';
  elements.selectedMeta.textContent = selected
    ? `${selected.status} · ${selected.numWorkers} workers · ${formatDuration(selected.durationMs)} duration`
    : 'Create or select a worker manager.';

  elements.startButton.disabled = !hasSelected || selected.status === 'running';
  elements.stopButton.disabled = !hasSelected || selected.status !== 'running';
  elements.cleanButton.disabled = !hasSelected || selected.status === 'cleaning';
  elements.deleteButton.disabled = !hasSelected || selected.status === 'running';
}

function renderWorkerList() {
  if (state.workers.length === 0) {
    elements.workerList.innerHTML = '<div class="empty-state">아직 생성된 테스트가 없습니다.</div>';
    return;
  }

  elements.workerList.replaceChildren(...state.workers.map((worker) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'worker-item';
    item.setAttribute('aria-selected', String(worker.id === state.selectedId));
    item.addEventListener('click', () => {
      state.selectedId = worker.id;
      render();
      refreshAll().catch((error) => showToast(error.message));
    });

    item.innerHTML = `
      <div class="worker-top">
        <span class="worker-id">${escapeHtml(shortId(worker.id))}</span>
        <span class="pill ${escapeHtml(worker.status)}">${escapeHtml(worker.status)}</span>
      </div>
      <div class="worker-meta">
        <span>${escapeHtml(worker.dbName)}</span>
        <span>${worker.numWorkers} workers</span>
        <span>${formatDuration(worker.elapsedTime)}</span>
      </div>
    `;

    return item;
  }));
}

function renderDistribution() {
  const selectedDb = getSelectedWorker()?.dbName || elements.dbName.value || 'postgres';
  elements.distributionLabel.textContent = selectedDb;

  if (state.distribution.length === 0) {
    elements.distributionList.innerHTML = '<div class="empty-state">분포 데이터가 없습니다.</div>';
    return;
  }

  const max = Math.max(...state.distribution.map((item) => item.count), 1);
  const rows = state.distribution
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)
    .map((item) => {
      const row = document.createElement('div');
      row.className = 'distribution-row';
      row.innerHTML = `
        <div>
          <div class="row-label">${escapeHtml(shortId(item.group_id))}</div>
          <div class="bar-track"><div class="bar-fill" style="width: ${(item.count / max) * 100}%"></div></div>
        </div>
        <span class="row-count">${formatNumber(item.count)}</span>
      `;
      return row;
    });

  elements.distributionList.replaceChildren(...rows);
}

function resizeCanvas() {
  const rect = elements.canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  elements.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  elements.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function animate(now) {
  const delta = Math.min(40, now - state.lastTick);
  state.lastTick = now;

  draw(delta / 1000, now / 1000);
  requestAnimationFrame(animate);
}

function draw(delta, time) {
  const width = elements.canvas.clientWidth;
  const height = elements.canvas.clientHeight;
  const centerX = width * 0.54;
  const centerY = height * 0.43;
  const running = state.workers.filter((worker) => worker.status === 'running');
  const ready = state.workers.filter((worker) => worker.status === 'ready');
  const stopped = state.workers.filter((worker) => worker.status === 'stopped');
  const loadLevel = Math.min(1, running.reduce((total, worker) => total + worker.numWorkers, 0) / 32);

  ctx.clearRect(0, 0, width, height);
  drawGrid(width, height, time);
  drawDatabase(centerX, centerY, loadLevel, time);
  drawWorkerRings(centerX, centerY, running, ready, stopped, time);
  updateParticles(centerX, centerY, running, delta);
  drawParticles();
}

function drawGrid(width, height, time) {
  ctx.fillStyle = '#111a18';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(194, 217, 209, 0.08)';
  ctx.lineWidth = 1;
  const gap = 36;
  const offset = (time * 18) % gap;

  for (let x = -gap + offset; x < width + gap; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height * 0.28, height);
    ctx.stroke();
  }

  for (let y = offset; y < height + gap; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawDatabase(x, y, loadLevel, time) {
  const pulse = 1 + Math.sin(time * 4) * 0.03 * (1 + loadLevel);
  const radius = 86 * pulse;

  ctx.save();
  ctx.translate(x, y);

  const glow = ctx.createRadialGradient(0, 0, 20, 0, 0, 190);
  glow.addColorStop(0, `rgba(31, 138, 91, ${0.2 + loadLevel * 0.22})`);
  glow.addColorStop(0.45, 'rgba(15, 124, 138, 0.12)');
  glow.addColorStop(1, 'rgba(15, 124, 138, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 190, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#dfeee8';
  ctx.strokeStyle = '#7eb6a0';
  ctx.lineWidth = 2;
  roundedRect(-96, -56, 192, 112, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fbf9';
  ctx.beginPath();
  ctx.ellipse(0, -56, 96, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c9ddd4';
  ctx.beginPath();
  ctx.ellipse(0, 56, 96, 24, 0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#18211d';
  ctx.font = '700 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PostgreSQL', 0, -6);
  ctx.font = '13px Inter, sans-serif';
  ctx.fillStyle = '#4c6258';
  ctx.fillText(`${Math.round(loadLevel * 100)}% load signal`, 0, 18);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * loadLevel);
  ctx.stroke();

  ctx.restore();
}

function drawWorkerRings(centerX, centerY, running, ready, stopped, time) {
  const groups = [
    { list: ready, radius: 155, color: '#8ca39a' },
    { list: stopped, radius: 210, color: '#bb7a12' },
    { list: running, radius: 265, color: '#38b7c7' },
  ];

  for (const group of groups) {
    const points = Math.max(group.list.reduce((total, worker) => total + worker.numWorkers, 0), group.list.length);
    if (points === 0) {
      continue;
    }

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2 + time * (group.radius === 265 ? 0.48 : 0.12);
      const wobble = Math.sin(time * 2 + i) * 8;
      const x = centerX + Math.cos(angle) * (group.radius + wobble);
      const y = centerY + Math.sin(angle) * (group.radius * 0.58 + wobble);

      ctx.fillStyle = group.color;
      ctx.beginPath();
      ctx.arc(x, y, group.radius === 265 ? 4.5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function updateParticles(centerX, centerY, running, delta) {
  const spawnCount = running.reduce((total, worker) => total + worker.numWorkers, 0);

  for (let i = 0; i < Math.min(spawnCount, 18); i++) {
    if (Math.random() > delta * 8) {
      continue;
    }

    const angle = Math.random() * Math.PI * 2;
    state.particles.push({
      x: centerX + Math.cos(angle) * 285,
      y: centerY + Math.sin(angle) * 165,
      targetX: centerX + (Math.random() - 0.5) * 80,
      targetY: centerY + (Math.random() - 0.5) * 45,
      life: 1,
      color: Math.random() > 0.5 ? '#62d4a0' : '#48bfd0',
    });
  }

  state.particles = state.particles
    .map((particle) => ({
      ...particle,
      x: particle.x + (particle.targetX - particle.x) * delta * 2.4,
      y: particle.y + (particle.targetY - particle.y) * delta * 2.4,
      life: particle.life - delta * 0.8,
    }))
    .filter((particle) => particle.life > 0);
}

function drawParticles() {
  for (const particle of state.particles) {
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3.2 + (1 - particle.life) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function getSelectedWorker() {
  return state.workers.find((worker) => worker.id === state.selectedId) || null;
}

function shortId(id) {
  if (!id) {
    return '';
  }
  return id.length > 13 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
}

function formatDuration(ms) {
  const seconds = Math.floor((ms || 0) / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  if (minutes <= 0) {
    return `${rest}s`;
  }

  return `${minutes}m ${rest}s`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');

  if (state.toastTimer) {
    clearTimeout(state.toastTimer);
  }

  state.toastTimer = setTimeout(() => {
    elements.toast.classList.remove('visible');
  }, 2400);
}

resizeCanvas();
refreshAll().catch((error) => {
  elements.connectionStatus.textContent = 'API 연결 실패';
  showToast(error.message);
});
setInterval(() => {
  refreshAll().catch((error) => {
    elements.connectionStatus.textContent = 'API 연결 실패';
    showToast(error.message);
  });
}, 1500);
requestAnimationFrame(animate);
