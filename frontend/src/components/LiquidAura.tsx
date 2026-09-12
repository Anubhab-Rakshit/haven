import React, { useEffect, useRef } from 'react';

const VS = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FS = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec2 u_click_pos;
  uniform float u_click_time;

  float random (in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  float fbm (in vec2 st) {
      float value = 0.0;
      float amplitude = .5;
      for (int i = 0; i < 4; i++) {
          value += amplitude * noise(st);
          st *= 2.;
          amplitude *= .5;
      }
      return value;
  }

  void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      st.x *= u_resolution.x / u_resolution.y;

      vec2 mouse = u_mouse / u_resolution;
      mouse.x *= u_resolution.x / u_resolution.y;
      float distToMouse = distance(st, mouse);
      float mouseInfluence = smoothstep(0.4, 0.0, distToMouse);

      // Shockwave calculation
      float clickDist = distance(st, u_click_pos);
      float clickAge = u_time - u_click_time;
      if (clickAge > 0.0 && clickAge < 3.0) {
          float wave = sin((clickDist - clickAge * 0.4) * 40.0);
          float shock = wave * exp(-clickAge * 2.0) * smoothstep(1.0, 0.0, clickDist);
          st += normalize(st - u_click_pos + vec2(0.0001)) * shock * 0.15;
      }

      vec2 q = vec2(0.);
      q.x = fbm(st + 0.00 * u_time);
      q.y = fbm(st + vec2(1.0));

      vec2 r = vec2(0.);
      r.x = fbm(st + 1.0*q + vec2(1.7,9.2) + 0.15*u_time + mouseInfluence * 0.5);
      r.y = fbm(st + 1.0*q + vec2(8.3,2.8) + 0.126*u_time);

      float f = fbm(st + r);

      vec3 colorA = vec3(0.01, 0.01, 0.02);
      vec3 colorB = vec3(0.18, 0.11, 0.35);
      vec3 colorC = vec3(0.4, 0.3, 0.15);
      
      vec3 color = mix(colorA, colorB, clamp((f*f)*4.0,0.0,1.0));
      color = mix(color, colorC, clamp(length(q),0.0,1.0));
      
      color += vec3(0.1, 0.05, 0.15) * mouseInfluence;
      
      gl_FragColor = vec4(color * (f*f*f + .6*f*f + .5*f), 1.0);
  }
`;

export const LiquidAura: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn("WebGL not supported, falling back to CSS");
      return;
    }

    // Compile Shader Function
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(VS, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(FS, gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Geometry (Fullscreen Quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0, -1.0,  1.0,  1.0
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uClickPos = gl.getUniformLocation(program, "u_click_pos");
    const uClickTime = gl.getUniformLocation(program, "u_click_time");

    let animationFrame: number;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let clickX = -1000;
    let clickY = -1000;
    let clickTime = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = window.innerHeight - e.clientY; // Invert Y for WebGL
    };
    const handleClick = (e: MouseEvent) => {
      clickX = e.clientX;
      clickY = window.innerHeight - e.clientY;
      clickTime = performance.now();
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform2f(uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };
    window.addEventListener('resize', resize);
    resize();

    // Render Loop
    const startTime = performance.now();
    const render = (time: number) => {
      gl.uniform1f(uTime, (time - startTime) * 0.001);
      
      // Interpolate mouse
      const targetMouse = [mouseX, mouseY];
      const currentMouse = (uMouse ? gl.getUniform(program, uMouse) : null) || [mouseX, mouseY];
      gl.uniform2f(uMouse, 
        currentMouse[0] + (targetMouse[0] - currentMouse[0]) * 0.05, 
        currentMouse[1] + (targetMouse[1] - currentMouse[1]) * 0.05
      );

      // Pass click uniforms (normalized to screen ratio)
      const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      gl.uniform2f(uClickPos, (clickX / gl.drawingBufferWidth) * aspect, clickY / gl.drawingBufferHeight);
      gl.uniform1f(uClickTime, (clickTime - startTime) * 0.001);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          width: '100vw', height: '100vh',
          zIndex: 0, // Behind interactive layout, in front of CSS background
          pointerEvents: 'none'
        }}
      />
      <div className="noise-overlay" />
    </>
  );
};
