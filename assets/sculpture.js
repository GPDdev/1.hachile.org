(() => {
  const canvas = document.getElementById("specimen");
  const toggle = document.getElementById("motion-toggle");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) {
    if (toggle) toggle.hidden = true;
    return;
  }

  // The tube follows one closed strand winding twice around a three-lobed core.
  const rings = 128;
  const sides = 24;
  const stride = sides + 1;
  const tau = 2 * Math.PI;
  function center(t) {
    const r = 1.94 + 0.83 * Math.cos(3 * t);
    return [r * Math.cos(2 * t), r * Math.sin(2 * t), 0.94 * Math.sin(3 * t)];
  }
  function unit(vector) {
    const length = Math.hypot(...vector);
    return vector.map(value => value / length);
  }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  const centers = Array.from({ length: rings }, (_, i) => center(tau * i / rings));
  const vertices = [];
  for (let i = 0; i <= rings; i++) {
    const t = tau * i / rings;
    const c = centers[i % rings];
    const next = center(t + 0.001);
    const prev = center(t - 0.001);
    const tangent = unit(next.map((v, k) => v - prev[k]));
    const b = unit(cross(tangent, [Math.cos(2 * t), Math.sin(2 * t), 0]));
    const a = cross(b, tangent);
    for (let j = 0; j <= sides; j++) {
      const angle = tau * j / sides;
      const normal = a.map((v, k) => v * Math.cos(angle) + b[k] * Math.sin(angle));
      const pos = c.map((v, k) => v + 0.47 * normal[k]);
      // The neighboring strand absorbs light most strongly on the inside of a crossing.
      let nearest = Infinity;
      for (let k = 0; k < rings; k += 2) {
        const delta = Math.abs(i % rings - k);
        if (Math.min(delta, rings - delta) < rings / 5) continue;
        const d = centers[k];
        nearest = Math.min(nearest, Math.hypot(pos[0]-d[0], pos[1]-d[1], pos[2]-d[2]));
      }
      vertices.push({pos, normal, cavity: Math.max(0, 1.85 - nearest) * 45,
        u: i / rings * 270 * 32, v: j / sides * 31 * 32});
    }
  }

  // A repeating thread and its short shadow are sampled in surface coordinates,
  // so the printed fibers turn with the object instead of floating on the screen.
  const weave = new Int8Array(32 * 32);
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const dx = (x - 16) / 16;
      const dy = (y - 16) / 16;
      const ink = Math.exp(-4 * dx * dx - 10 * dy * dy);
      const glint = Math.exp(-5 * (dx + 0.09) ** 2 - 14 * (dy + 0.36) ** 2);
      weave[y * 32 + x] = Math.round(-56 * ink + 30 * glint);
    }
  }
  const stops = [[5, 15, 65], [12, 31, 105], [24, 50, 160], [35, 70, 204], [65, 109, 240], [134, 166, 255], [201, 216, 255]];
  const palette = new Uint32Array(256);
  const bytes = new Uint8Array(palette.buffer);
  for (let i = 0; i < 256; i++) {
    const level = i / 255 * (stops.length - 1);
    const n = Math.min(stops.length - 2, Math.floor(level));
    for (let k = 0; k < 3; k++) bytes[4*i+k] = Math.round(stops[n][k] + (stops[n+1][k] - stops[n][k]) * (level - n));
    bytes[4*i+3] = 255;
  }

  const screen = vertices.map(({u, v}) => ({x: 0, y: 0, z: 0, light: 0, u, v}));
  let image, pixels, depths;
  let yaw = -0.27, pitch = 0.47;
  const roll = 1.2;
  const cr = Math.cos(roll), sr = Math.sin(roll);
  function drawTriangle(a, b, c) {
    const bx = b.x - a.x, by = b.y - a.y, cx = c.x - a.x, cy = c.y - a.y;
    const area = bx * cy - by * cx;
    if (area < 0.01) return;
    const x0 = Math.max(0, Math.floor(Math.min(a.x,b.x,c.x)));
    const x1 = Math.min(image.width-1, Math.ceil(Math.max(a.x,b.x,c.x)));
    const y0 = Math.max(0, Math.floor(Math.min(a.y,b.y,c.y)));
    const y1 = Math.min(image.height-1, Math.ceil(Math.max(a.y,b.y,c.y)));
    const dx1 = cy / area, dy1 = -cx / area, dx2 = -by / area, dy2 = bx / area;
    const dz1 = b.z - a.z, dz2 = c.z - a.z, dl1 = b.light - a.light, dl2 = c.light - a.light;
    const du1 = b.u - a.u, du2 = c.u - a.u, dv1 = b.v - a.v, dv2 = c.v - a.v;
    for (let y = y0; y <= y1; y++) {
      let w1 = (x0 + 0.5 - a.x)*dx1 + (y + 0.5 - a.y)*dy1;
      let w2 = (x0 + 0.5 - a.x)*dx2 + (y + 0.5 - a.y)*dy2;
      let p = y * image.width + x0;
      for (let x = x0; x <= x1; x++, p++, w1 += dx1, w2 += dx2) {
        if (w1 < 0 || w2 < 0 || w1 + w2 > 1) continue;
        const z = a.z + w1*dz1 + w2*dz2;
        if (z <= depths[p]) continue;
        depths[p] = z;
        const u = (a.u + w1*du1 + w2*du2) | 0;
        const v = (a.v + w1*dv1 + w2*dv2) | 0;
        const texture = weave[((v & 31) << 5) + (u & 31)];
        const light = a.light + w1*dl1 + w2*dl2 + texture;
        pixels[p] = palette[Math.max(0, Math.min(255, light | 0))];
      }
    }
  }
  function render() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(850000 / (rect.width * rect.height)));
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (!image || image.width !== width || image.height !== height) {
      canvas.width = width;
      canvas.height = height;
      image = context.createImageData(width, height);
      pixels = new Uint32Array(image.data.buffer);
      depths = new Float32Array(width * height);
    }
    pixels.fill(0);
    depths.fill(-Infinity);
    const ay = Math.cos(yaw), by = Math.sin(yaw), ax = Math.cos(pitch), bx = Math.sin(pitch);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < vertices.length; i++) {
      const {pos, normal, cavity} = vertices[i];
      const s = screen[i];
      const x = ay*pos[0] + by*pos[2], z = ay*pos[2] - by*pos[0];
      const y = ax*pos[1] - bx*z;
      s.x = 1.16 * (cr*x - sr*y);
      s.y = -(sr*x + cr*y);
      s.z = bx*pos[1] + ax*z;
      minX = Math.min(minX, s.x); maxX = Math.max(maxX, s.x);
      minY = Math.min(minY, s.y); maxY = Math.max(maxY, s.y);
      const nx = ay*normal[0] + by*normal[2], nz = ay*normal[2] - by*normal[0];
      const ny = ax*normal[1] - bx*nz;
      const light = -0.44*(cr*nx - sr*ny) + 0.79*(sr*nx + cr*ny) + 0.42*(bx*normal[1] + ax*nz);
      s.light = 78 + 108 * light + 36 * Math.max(0, light) ** 5 - cavity;
    }
    const scale = Math.min(width * 0.89 / (maxX-minX), height * 0.88 / (maxY-minY));
    const offsetX = (width - (maxX+minX)*scale) / 2, offsetY = (height - (maxY+minY)*scale) / 2;
    for (const s of screen) {
      s.x = s.x*scale + offsetX;
      s.y = s.y*scale + offsetY;
    }
    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < sides; j++) {
        const k = i*stride + j;
        drawTriangle(screen[k], screen[k+stride], screen[k+stride+1]);
        drawTriangle(screen[k], screen[k+stride+1], screen[k+1]);
      }
    }
    context.putImageData(image, 0, 0);
    if (!canvas.dataset.ready) {
      canvas.dataset.ready = "true";
      if (toggle) toggle.hidden = false;
      const label = document.querySelector(".model-label");
      if (label) label.textContent = "拖动旋转";
    }
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reduced.matches, visible = false, dirty = true, frame = 0, last = 0;
  let pointer = null, lastX = 0, lastY = 0;
  function schedule() {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden) return;
    const moving = !paused && pointer === null;
    if (dirty || (moving && now - last >= 1000/25)) {
      if (moving && last) yaw += Math.min(now - last, 80) * 0.000105;
      render();
      dirty = false;
      last = now;
    }
    if (moving) schedule();
  }
  function refresh() {
    dirty = true;
    schedule();
  }
  function setPaused(value) {
    paused = value;
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.textContent = paused ? "继续旋转" : "暂停旋转";
    }
    last = 0;
    refresh();
  }
  toggle?.addEventListener("click", () => setPaused(!paused));
  reduced.addEventListener("change", () => setPaused(reduced.matches));
  canvas.style.touchAction = "pan-y";
  canvas.addEventListener("pointerdown", e => {
    if (!e.isPrimary || e.button !== 0) return;
    pointer = e.pointerId;
    lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(pointer);
  });
  canvas.addEventListener("pointermove", e => {
    if (e.pointerId !== pointer) return;
    yaw += (e.clientX - lastX) * 0.009;
    pitch += (e.clientY - lastY) * 0.009;
    lastX = e.clientX; lastY = e.clientY;
    refresh();
  });
  canvas.addEventListener("lostpointercapture", () => {
    pointer = null;
    last = 0;
    refresh();
  });
  canvas.addEventListener("keydown", e => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    if (e.key === "ArrowLeft") yaw -= 0.15;
    if (e.key === "ArrowRight") yaw += 0.15;
    if (e.key === "ArrowUp") pitch -= 0.15;
    if (e.key === "ArrowDown") pitch += 0.15;
    refresh();
  });
  new ResizeObserver(refresh).observe(canvas);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    last = 0;
    if (visible) refresh();
  });
  observer.observe(canvas);
  document.addEventListener("visibilitychange", () => { last = 0; refresh(); });
  setPaused(paused);
})();
