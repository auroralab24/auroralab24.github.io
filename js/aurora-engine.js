/**
 * Aurora Engine — Full-Screen Curtain Aurora
 * 
 * 기법: 저해상도 ImageData 픽셀 렌더링 → 업스케일
 * 노이즈 기반으로 매 픽셀 색상 직접 계산 = 아티팩트 0
 * 수직 커튼 패턴: x축 고주파 + y축 저주파 노이즈
 */
(function () {
    'use strict';

    // ── Seeded Random (Deterministic) ──
    let _seed = 42; 
    function setSeed(s) { _seed = s; }
    function seededRandom() {
        _seed = (_seed * 9301 + 49297) % 233280;
        return _seed / 233280;
    }

    // ── Perlin Noise ──
    const P = new Uint8Array(512);
    function initNoise() {
        setSeed(42); // Always start with same seed for noise
        const b = new Uint8Array(256);
        for (let i = 0; i < 256; i++) b[i] = i;
        for (let i = 255; i > 0; i--) { const j = (seededRandom() * (i + 1)) | 0;[b[i], b[j]] = [b[j], b[i]]; }
        for (let i = 0; i < 512; i++) P[i] = b[i & 255];
    }
    initNoise();
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function nlerp(a, b, t) { return a + t * (b - a); }
    function ngrad(h, x, y) { const v = h & 3; return ((v & 1) ? -x : x) + ((v & 2) ? -y : y); }
    function pnoise(x, y) {
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        x -= Math.floor(x); y -= Math.floor(y);
        const u = fade(x), v = fade(y), A = P[X] + Y, B = P[X + 1] + Y;
        return nlerp(nlerp(ngrad(P[A], x, y), ngrad(P[B], x - 1, y), u),
            nlerp(ngrad(P[A + 1], x, y - 1), ngrad(P[B + 1], x - 1, y - 1), u), v);
    }
    function fbm(x, y, oct) {
        let v = 0, a = 1, f = 1, m = 0;
        for (let i = 0; i < oct; i++) { v += pnoise(x * f, y * f) * a; m += a; a *= 0.5; f *= 2.0; }
        return v / m;
    }

    // ── Star ──
    class Star {
        constructor(w, h) { this.reset(w, h); }
        reset(w, h) {
            this.ox = seededRandom() * w; this.oy = seededRandom() * h;
            this.x = this.ox; this.y = this.oy; this.vx = 0; this.vy = 0;
            this.r = seededRandom() * 1.4 + 0.3; this.d = seededRandom();
            this.ph = seededRandom() * 6.28; this.sp = 0.005 + seededRandom() * 0.012;
            this.repelForce = 0.5 + Math.pow(seededRandom(), 2) * 15; 
            this.returnSpeed = 0.04 + seededRandom() * 0.3; 
        }
        update(mx, my, t) {
            this.a = (0.15 + 0.85 * ((Math.sin(t * this.sp + this.ph) + 1) * 0.5)) * 0.5;
            const dx = this.x - mx, dy = this.y - my, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130 && dist > 1) { const f = (1 - dist / 130) * this.repelForce; this.vx += dx / dist * f; this.vy += dy / dist * f; }
            this.x += this.vx; this.y += this.vy; this.vx *= 0.94; this.vy *= 0.94;
            this.x += (this.ox - this.x) * this.returnSpeed; this.y += (this.oy - this.y) * this.returnSpeed;
        }
        draw(ctx, px, py) {
            const sx = this.x + px * this.d * 30, sy = this.y + py * this.d * 30;
            const a = this.a * (0.3 + this.d * 0.7);
            if (this.r > 0.6) {
                const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.r * 4);
                g.addColorStop(0, `rgba(210,230,255,${a * 0.12})`); g.addColorStop(1, 'rgba(210,230,255,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, this.r * 4, 0, 6.28); ctx.fill();
            }
            ctx.fillStyle = `rgba(230,240,255,${a})`;
            ctx.beginPath(); ctx.arc(sx, sy, this.r, 0, 6.28); ctx.fill();
        }
    }

    // ── Setup ──
    const cvs = document.createElement('canvas');
    cvs.id = 'aurora-canvas';
    cvs.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-9;pointer-events:none;';
    const ctx = cvs.getContext('2d');
    const mount = document.querySelector('.bg-engine');
    mount ? mount.appendChild(cvs) : document.body.prepend(cvs);

    // 오로라 전용 오프스크린 (해상도 약간 상향 및 보간 개선)
    const AW = 320, AH = 200; 
    const aCvs = document.createElement('canvas');
    aCvs.width = AW; aCvs.height = AH;
    const aCtx = aCvs.getContext('2d');
    const imgData = aCtx.createImageData(AW, AH);
    const buf = imgData.data;

    let W, H, dpr;
    let mx = 0, my = 0, tpx = 0, tpy = 0, px = 0, py = 0;
    let scrollY = 0, t = 4000; // Fixed start time
    const stars = [];

    function resize() {
        W = innerWidth; H = innerHeight;
        dpr = Math.min(devicePixelRatio || 1, 2);
        cvs.width = W * dpr; cvs.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function initStars() { 
        setSeed(100); // Unique seed for stars, reset every time
        stars.length = 0; 
        const count = Math.floor((W * H) / 600); // Scale star count based on screen area (approx 3000 for PC)
        for (let i = 0; i < count; i++) stars.push(new Star(W, H)); 
    }

    resize(); initStars();
    addEventListener('resize', () => { resize(); initStars(); });
    
    function burstStars(clientX, clientY) {
        mx = clientX; my = clientY;
        for (const s of stars) {
            const dx = s.x - mx, dy = s.y - my, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const f = (1 - dist / 200) * 30 * s.repelForce; // Burst force
                s.vx += dx / dist * f;
                s.vy += dy / dist * f;
            }
        }
    }

    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; tpx = (e.clientX / W - 0.5) * 2; tpy = (e.clientY / H - 0.5) * 2; });
    addEventListener('click', e => burstStars(e.clientX, e.clientY));
    addEventListener('touchmove', e => { if (e.touches.length) { mx = e.touches[0].clientX; my = e.touches[0].clientY; tpx = (mx / W - 0.5) * 2; tpy = (my / H - 0.5) * 2; } }, { passive: true });
    addEventListener('touchstart', e => { if (e.touches.length) { burstStars(e.touches[0].clientX, e.touches[0].clientY); tpx = (mx / W - 0.5) * 2; tpy = (my / H - 0.5) * 2; } }, { passive: true });
    addEventListener('scroll', () => { scrollY = window.scrollY || 0; });

    // ── 오로라 픽셀 렌더링 ──
    function renderAurora(time, sr) {
        const T = time * 0.00025;

        for (let y = 0; y < AH; y++) {
            const yN = y / AH; 

            for (let x = 0; x < AW; x++) {
                const xN = x / AW; 
                const screenX = xN * W;
                const screenY = yN * H;
                const noiseX = (screenX + (1920 - W) / 2) / 1920;
                const noiseY = (screenY + (1080 - H) / 2) / 1080;

                const xOff = px * 0.05;
                const yOff = py * 0.03;

                const curtain = fbm(
                    (noiseX + xOff) * 6.0 + T * 1.2 + sr * 0.2,
                    (noiseY + yOff) * 0.8 + T * 0.3,
                    5
                );

                const shape = fbm(
                    (noiseX + xOff) * 1.5 + T * 0.5 + sr * 0.3 + 50,
                    (noiseY + yOff) * 1.0 + T * 0.2 + 50,
                    4
                );

                let yBright;
                if (yN < 0.15) yBright = yN / 0.15 * 0.5;
                else if (yN < 0.55) yBright = 0.5 + (yN - 0.15) / 0.4 * 0.5;
                else if (yN < 0.80) yBright = 1.0 - (yN - 0.55) / 0.25 * 0.6;
                else yBright = 0.4 * (1 - (yN - 0.80) / 0.20);

                const curtainBright = Math.max(0, curtain * 0.5 + 0.5); 
                const shapeMask = Math.max(0, shape * 0.4 + 0.6); 

                let bright = curtainBright * shapeMask * yBright;
                bright = Math.pow(bright, 0.9); 
                bright = Math.min(1, bright * 1.8); 

                // ── 색상 보간 (덩어리 방지) ──
                const colorMix = fbm(
                    (noiseX + xOff) * 2.0 + T * 0.3 + 100 + sr * 0.1,
                    noiseY * 0.5 + 100,
                    3
                );
                const cVal = (colorMix + 1) * 0.5; 

                let r, g, b;
                
                // 베이스 색상 (딥민트 -> 틸 -> 블루그린) — 연두빛 제거, 전체 통일
                const r1 = 5 + bright * 15,  g1 = 70 + bright * 155, b1 = 75 + bright * 145; // Deep Mint (틸로 통일)
                const r2 = 5 + bright * 20,  g2 = 70 + bright * 160, b2 = 70 + bright * 140; // Cyan
                const r3 = 10 + bright * 30, g3 = 60 + bright * 140, b3 = 80 + bright * 130; // Blue-Green

                // Smoothly blend based on cVal
                if (cVal < 0.5) {
                    const f = cVal * 2;
                    r = r1 * (1 - f) + r2 * f; g = g1 * (1 - f) + g2 * f; b = b1 * (1 - f) + b2 * f;
                } else {
                    const f = (cVal - 0.5) * 2;
                    r = r2 * (1 - f) + r3 * f; g = g2 * (1 - f) + g3 * f; b = b2 * (1 - f) + b3 * f;
                }

                // 상단 퍼플 틴트
                const purpleFade = Math.max(0, 1 - yN * 2.5); 
                if (purpleFade > 0.1) {
                    const pf = purpleFade * 0.4;
                    r = r * (1 - pf) + (40 + bright * 100) * pf;
                    g = g * (1 - pf) + (20 + bright * 40) * pf;
                    b = b * (1 - pf) + (80 + bright * 140) * pf;
                }

                if (bright > 0.7) {
                    const wf = (bright - 0.7) / 0.3 * 0.3;
                    r = r * (1 - wf) + 255 * wf; g = g * (1 - wf) + 255 * wf; b = b * (1 - wf) + 255 * wf;
                }

                const alpha = bright * 220; 

                const idx = (y * AW + x) * 4;
                buf[idx] = r; buf[idx+1] = g; buf[idx+2] = b; buf[idx+3] = alpha;
            }
        }

        aCtx.putImageData(imgData, 0, 0);
    }

    // ── 루프 ──
    function loop() {
        t++;
        px += (tpx - px) * 0.04;
        py += (tpy - py) * 0.04;
        const sr = (scrollY / Math.max(document.body.scrollHeight, 1)) * 8;

        // 블랙 배경
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        // 오로라 렌더링 (저해상도 픽셀)
        renderAurora(t, sr);

        // 업스케일하여 메인 캔버스에 그리기 (자연 블러)
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(aCvs, 0, 0, W, H);
        ctx.restore();

        // 별
        ctx.globalCompositeOperation = 'lighter';
        for (const s of stars) { s.update(mx, my, t); s.draw(ctx, px, py); }
        ctx.globalCompositeOperation = 'source-over';

        requestAnimationFrame(loop);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loop);
    else loop();
})();
