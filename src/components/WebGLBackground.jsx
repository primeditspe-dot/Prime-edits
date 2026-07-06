import React, { useEffect, useRef } from 'react';

const vertexShaderSource = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const fragmentShaderSource = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_scroll;

// hash / noise -------------------------------------------------------------
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 6; i++){
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;
  p.y -= u_scroll * 0.00045; // scroll parallax

  float t = u_time * 0.05;

  // domain warp -> liquid feel
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t)));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.5),
                fbm(p + 4.0 * q + vec2(8.3, 2.8) - t * 0.5));
  float f = fbm(p + 3.5 * r);

  // gentle mouse-driven lift
  float m = smoothstep(0.6, 0.0, distance(uv, u_mouse));

  // palette: ink -> teal -> electric blue -> cyan
  vec3 ink   = vec3(0.016, 0.020, 0.039);
  vec3 teal  = vec3(0.078, 0.643, 0.580);
  vec3 blue  = vec3(0.227, 0.525, 1.0);
  vec3 cyan  = vec3(0.298, 0.859, 0.910);

  vec3 col = ink;
  col = mix(col, teal, smoothstep(0.30, 0.80, f) * 0.40);
  col = mix(col, blue, smoothstep(0.50, 0.98, f) * 0.50);
  col = mix(col, cyan, pow(f, 3.5) * 0.7 + m * 0.20);

  // keep it mostly dark — bias toward ink, darker at the edges
  float vig = smoothstep(1.2, 0.15, length(uv - 0.5));
  col = mix(ink, col, 0.18 + 0.55 * vig);

  // subtle grain
  col += (hash(uv * u_time) - 0.5) * 0.015;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function WebGLBackground({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Initialize WebGL
    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      canvas.style.display = 'none';
      return;
    }

    // Shader compiler helper
    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    // Create program
    const program = gl.createProgram();
    const vs = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vs || !fs) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('WebGL Program Linking Error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full screen triangle positions
    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uRes = gl.getUniformLocation(program, 'u_res');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uScroll = gl.getUniformLocation(program, 'u_scroll');

    // Mouse coordinates tracking
    const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 };

    const handlePointerMove = (e) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Resolution & DPI scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    const resizeCanvas = () => {
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Frame loops
    let animationFrameId = 0;
    let isActive = true;
    const startTime = performance.now();

    const render = (time) => {
      if (!isActive) return;

      resizeCanvas();
      
      // Interpolate mouse movement for smooth delay physics
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, prefersReducedMotion ? 6 : (time - startTime) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, window.scrollY);

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    // Tab visibility handling to pause draw loops
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActive = false;
        cancelAnimationFrame(animationFrameId);
      } else if (!prefersReducedMotion) {
        isActive = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup listeners and WebGL program
    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  const isFixed = className.includes('fixed');

  return (
    <div className={`inset-0 -z-10 overflow-hidden ${isFixed ? '' : 'absolute'} ${className}`}>
      {/* Fallback gradients if WebGL is disabled or not supported */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(120% 90% at 50% 0%, #081026 0%, #04050a 52%), radial-gradient(55% 45% at 82% 18%, rgba(20,163,148,0.18), transparent 70%)'
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
