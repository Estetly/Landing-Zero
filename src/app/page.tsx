"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Script from "next/script";
import Image from "next/image";

export default function Home() {
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const sublineRef = useRef<HTMLParagraphElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);
  const didAnimateRef = useRef<boolean>(false);

  useEffect(() => {
    if (didAnimateRef.current) return; // guard against StrictMode double-invoke in dev
    didAnimateRef.current = true;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const maskify = (el: HTMLElement | null) => {
      if (!el) return;
      const text = el.textContent ?? "";
      const words = text.split(" ");
      const html = words
        .map((word) => {
          const chars = Array.from(word)
            .map((ch) => `<span class='inline-block' data-char>${ch}</span>`) // start neutral; we set y via GSAP
            .join("");
          // Add a tiny bottom padding so descenders (g, y) aren't clipped by the mask
          return `<span class='inline-block overflow-hidden align-baseline' style='padding-bottom:.01em'><span class='inline-block'>${chars}</span></span>&nbsp;`;
        })
        .join("");
      el.innerHTML = html;
    };

    maskify(headlineRef.current);
    maskify(sublineRef.current);

    const headlineChars = (headlineRef.current?.querySelectorAll("[data-char]") || []) as unknown as Element[];
    const sublineChars = (sublineRef.current?.querySelectorAll("[data-char]") || []) as unknown as Element[];

    // Set initial state below the mask, then animate up
    gsap.set(headlineChars, { yPercent: 100 });
    gsap.set(sublineChars, { yPercent: 100 });
    if (buttonRef.current) gsap.set(buttonRef.current, { opacity: 0, scale: 0.9 });

    // No pre-button dots loader anymore

    tl.fromTo(
      logoRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 }
    )
      .to(headlineChars, { yPercent: 0, duration: 0.45, stagger: 0.02 }, "<0.1")
      .to(sublineChars, { yPercent: 0, duration: 0.5, stagger: 0.02 }, ">-0.1")
      .fromTo(
        buttonRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' },
        "<0.05"
      );

    // Button hover/click GSAP interactions (text slides left, icon enters from right)
    const btn = buttonRef.current as HTMLAnchorElement | null;
    if (btn) {
      const label = btn.querySelector('.btn-label');
      const icon = btn.querySelector('.btn-icon');
      if (icon) gsap.set(icon, { x: 8, opacity: 0 });
      const onEnter = () => {
        gsap.to(label, { x: -4, duration: 0.2, ease: 'power2.out' });
        gsap.to(icon, { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' });
      };
      const onLeave = () => {
        gsap.to(label, { x: 0, duration: 0.2, ease: 'power2.inOut' });
        gsap.to(icon, { x: 8, opacity: 0, duration: 0.2, ease: 'power2.inOut' });
      };
      const onDown = () => gsap.to(btn, { scale: 0.98, duration: 0.15, ease: 'power2.out' });
      const onUp = () => gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power2.out' });
      btn.addEventListener('mouseenter', onEnter);
      btn.addEventListener('mouseleave', onLeave);
      btn.addEventListener('mousedown', onDown);
      btn.addEventListener('mouseup', onUp);
      return () => {
        btn.removeEventListener('mouseenter', onEnter);
        btn.removeEventListener('mouseleave', onLeave);
        btn.removeEventListener('mousedown', onDown);
        btn.removeEventListener('mouseup', onUp);
      };
    }
   
  }, []);

  return (
    <main className="font-sans relative min-h-screen h-dvh w-full overflow-hidden bg-white text-neutral-900">
      {/* unicorn.studio background placeholder */}
      <div
        id="unicorn-studio-bg"
        aria-label="unicorn.studio interactive background placeholder"
        className="absolute inset-5 z-0 rounded-[20px] ring-1 ring-neutral-200 overflow-hidden"
      >
        <UnicornBackground />
        <Script
          src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js"
          strategy="afterInteractive"
          onLoad={() => {
            const w = window as unknown as { UnicornStudio?: { init?: () => void; isInitialized?: boolean } };
            if (w.UnicornStudio && !w.UnicornStudio.isInitialized) {
              w.UnicornStudio.init?.();
              w.UnicornStudio.isInitialized = true;
            }
          }}
        />
      </div>

      {/* shader trail canvas */}
      <TrailShader />

      {/* header/logo */}
      <div ref={logoRef} className="absolute left-11 top-12 sm:left-14 sm:top-12 z-10 select-none">
        <Image src="/logo_black.svg" alt="Estety" width={140} height={28} priority />
      </div>

      {/* bottom-right CTA + isotype */}
      <div className="absolute bottom-[110px] right-12 sm:bottom-12 sm:right-12 z-50 flex items-center gap-6 pointer-events-auto">
        <a
          ref={buttonRef}
          href="mailto:contact@estetly.com?subject=Contact%20from%20Estety%20Landing"
          className="group inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full px-6 py-3 text-sm font-medium tracking-wide shadow-sm transition-[background-color,color,transform] duration-200 focus:outline-none outline-none bg-transparent text-neutral-900 border border-neutral-900 hover:bg-neutral-900 hover:text-white"
        >
          <span className="relative flex items-center gap-2">
            <span className="btn-label leading-none">Contact-us</span>
            <span className="btn-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </span>
          </span>
        </a>
        <Image src="/isotype_black.svg" alt="Estety isotype" width={36} height={36} />
      </div>

      {/* hero text bottom-left */}
      <section className="absolute bottom-[220px] left-11 right-6 sm:bottom-40 sm:left-14 sm:right-10 z-10 pointer-events-none">
        <h1
          ref={headlineRef}
          className="text-neutral-900 text-[7vw] leading-[1] sm:text-[5.5vw] md:text-[4.2vw] font-medium tracking-[-0.02em] max-w-[20ch]"
        >
          We’re building something extraordinary for your health
        </h1>
        <p ref={sublineRef} className="mt-2 text-base sm:text-lg text-neutral-500 leading-[1.15] pointer-events-auto">
          Stay tuned.
        </p>
      </section>
    </main>
  );
}

function TrailShader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(window.innerWidth);
      height = Math.floor(window.innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Minimal shader-based trail using fading framebuffer approach
    const vert = `#version 300 es
    precision highp float;
    in vec2 position;
    void main(){
      gl_Position = vec4(position, 0.0, 1.0);
    }`;

    const frag = `#version 300 es
    precision highp float;
    out vec4 outColor;
    uniform vec2 u_mouse;
    uniform vec2 u_res;
    uniform float u_time;
    // Soft radial based on mouse trail
    void main(){
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 m = u_mouse / u_res;
      float d = distance(uv, m);
      float ring = smoothstep(0.2, 0.0, d) * 0.25;
      float glow = 0.02 / (d*d + 0.001);
      float intensity = clamp(ring + glow, 0.0, 1.0);
      // subtle moving grain
      float grain = fract(sin(dot(uv * u_time, vec2(12.9898,78.233))) * 43758.5453) * 0.06;
      outColor = vec4(vec3(intensity + grain), intensity * 0.8);
    }`;

    const quadVerts = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");

    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.5;
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = height - e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const start = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = (performance.now() - start) * 0.001;
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);

      gl.clearColor(1, 1, 1, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-20"
      aria-hidden="true"
    />
  );
}

function UnicornBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;

    // Ensure a single project node fills the container
    host.innerHTML = "";
    const project = document.createElement("div");
    project.setAttribute("data-us-project", "dJ34ZwHBX1WDwnfIy5lR");
    project.style.width = "100%";
    project.style.height = "100%";
    host.appendChild(project);

    // Initialize if script already present
    const w = window as unknown as { UnicornStudio?: { init?: () => void; isInitialized?: boolean } };
    if (w.UnicornStudio && !w.UnicornStudio.isInitialized) {
      w.UnicornStudio.init?.();
      w.UnicornStudio.isInitialized = true;
    }
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
