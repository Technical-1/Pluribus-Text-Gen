import * as THREE from 'three'

// --- 1. SETUP SCENE ---
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)
camera.position.z = 120

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// --- 2. GENERATE TEXT TEXTURE ---
// We draw the text to a hidden 2D canvas and pass it to the shader as a map
function createTextTexture(text) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const width = 2048
  const height = 1024
  canvas.width = width
  canvas.height = height

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'white'
  ctx.font = 'bold 350px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text.toUpperCase(), width / 2, height / 2)

  const textMetrics = ctx.measureText(text.toUpperCase())
  const firstMetrics = text.length > 0 ? ctx.measureText(text[0].toUpperCase()) : { width: 0 }
  const textWidth = textMetrics.width || 1
  const firstWidth = firstMetrics.width || textWidth
  const startX = (width - textWidth) / 2
  const firstCenterPx = startX + firstWidth * 0.5
  const firstCenterUv = firstCenterPx / width
  const firstCenterWorldX = (firstCenterUv - 0.5) * 260

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return { texture, firstCenterWorldX }
}

// --- 3. CREATE PARTICLE SYSTEM ---
const geometry = new THREE.BufferGeometry()
const gridW = 200
const gridH = 150
const particlesCount = gridW * gridH
const positions = new Float32Array(particlesCount * 3)
const uvs = new Float32Array(particlesCount * 2)

for (let i = 0; i < particlesCount; i++) {
  const x = (i % gridW) / gridW
  const y = Math.floor(i / gridW) / gridH

  // Center the grid in 3D space
  positions[i * 3] = (x - 0.5) * 260
  positions[i * 3 + 1] = (y - 0.5) * 130
  positions[i * 3 + 2] = 0
  uvs[i * 2] = x
  uvs[i * 2 + 1] = y
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

// --- 4. THE SHADER MATERIAL ---
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: null },
    uWaveOrigin: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  },
  vertexShader: `
    uniform float uTime;
    uniform vec2 uWaveOrigin;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    varying vec3 vPos;
    varying float vHandoff;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vUv = uv;
      vPos = position;
      vHandoff = 0.0;

      vec3 pos = position;

      float noise = snoise(vec2(pos.x * 0.02, pos.y * 0.02 + uTime * 0.2));
      pos.z += noise * 2.0;

      float jx = snoise(vec2(pos.y * 0.05, pos.x * 0.05 + uTime * 0.1));
      float jy = snoise(vec2(pos.x * 0.05, pos.y * 0.05 - uTime * 0.1));
      pos.x += jx * 1.2;
      pos.y += jy * 1.2;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Wave-propelled handoff: move a subset of particles rightward as waves pass
      float distFromOrigin = length((pos.xy - uWaveOrigin) * 0.55);
      float wavePhase = distFromOrigin * 0.42 - uTime * 2.6;
      float waveInfluence = smoothstep(0.6, 0.96, sin(wavePhase));
      // Stronger handoff, primarily on text region in front of the wave
      float textBand = smoothstep(-30.0, 200.0, pos.x - uWaveOrigin.x);
      float handoffMask = step(snoise(vec2(pos.xy * 0.07 + uTime * 0.12)), 0.6) * waveInfluence * textBand * 0.9;
      vec2 handoffDir = normalize(vec2(1.0, 0.08 * snoise(vec2(pos.y * 0.05, uTime * 0.25))));
      pos.xy += handoffDir * 26.0 * handoffMask;
      vHandoff = handoffMask;

      // Fingerprint curvature: only bend letter pixels
      float textMask = texture2D(uTexture, uv).r;
      float curve = sin(pos.y * 0.08 + pos.x * 0.01) * 6.5;
      float curveY = cos(pos.x * 0.05 + pos.y * 0.02) * 2.0;
      pos.x += curve * textMask;
      pos.y += curveY * textMask;

      float sizeJitter = 0.8 + 0.4 * snoise(vec2(pos.x * 0.08, pos.y * 0.08));
      gl_PointSize = 2.8 * sizeJitter * (150.0 / -mvPosition.z);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec2 uWaveOrigin;
    varying vec2 vUv;
    varying vec3 vPos;
    varying float vHandoff;

    void main() {
      vec4 textState = texture2D(uTexture, vUv);
      float isText = textState.r;
      float carry = vHandoff;

      vec2 waveOrigin = uWaveOrigin; // anchor at the first letter for waves
      float distFromOrigin = length((vPos.xy - waveOrigin) * 0.55);
      float reveal = 1.0;

      float pulse = 1.0;

      float dist = length(vUv - 0.5);

      float wavePhase = distFromOrigin * 0.54 - uTime * 2.6 + (vPos.x * 0.05) + sin(vPos.y * 0.25) * 0.25;
      float ridgeA = smoothstep(0.36, 0.48, sin(wavePhase));
      float ridgeB = smoothstep(0.36, 0.48, sin(wavePhase + 0.65));
      float ridges = max(ridgeA, ridgeB);
      float ridgeStrength = pow(ridges, 0.9);
      float travelMix = 1.0;

      float hash = fract(sin(dot(vPos.xy, vec2(12.9898, 78.233))) * 43758.5453);

      vec3 color = vec3(0.0);
      float alpha = 0.0;

      if (isText > 0.02) {
        float textWeight = smoothstep(0.35, 0.85, isText);
        color = vec3(1.0);
        float dither = mix(0.85, 1.0, hash);
        float baseAlpha = 0.75 * textWeight;
        float ridgeAlpha = 0.35 * ridgeStrength * textWeight;
        alpha = (baseAlpha + ridgeAlpha) * dither;
        // Keep the first letter filled
        if (vPos.x < -40.0) {
          alpha = max(alpha, 0.95 * textWeight);
        }
        alpha = max(alpha, 0.7 * textWeight); // prevent shadowing when waves pass
        alpha += 0.25 * carry; // boost transferred particles
      } else {
        float ring = sin(distFromOrigin * 0.42 - uTime * 2.6);
        float ringMask = smoothstep(0.78, 0.97, ring);
        float gapDust = smoothstep(0.18, 0.48, ring) * hash;
        float cloud = step(0.95, hash) * 1.0;
        if (ringMask > 0.003 || gapDust > 0.015 || cloud > 0.0) {
          color = vec3(1.0);
          alpha = 0.16 * ringMask + 0.12 * gapDust + 0.12 * cloud;
          alpha += 0.15 * carry;
        } else {
          discard;
        }
      }

      vec2 coord = gl_PointCoord - vec2(0.5);
      if(length(coord) > 0.5) discard;
      gl_FragColor = vec4(color, alpha);
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
})

const particles = new THREE.Points(geometry, material)
scene.add(particles)

// Initialize texture and wave origin based on current input text
const initial = createTextTexture('PLURIBUS')
material.uniforms.uTexture.value = initial.texture
material.uniforms.uWaveOrigin.value.set(initial.firstCenterWorldX, 0)

// --- 5. ANIMATION LOOP ---
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const elapsedTime = clock.getElapsedTime()
  material.uniforms.uTime.value = elapsedTime
  renderer.render(scene, camera)
}

animate()

// --- 6. HANDLE RESIZE ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
})

// --- 7. HANDLE INPUT ---
const input = document.getElementById('textInput')
input.addEventListener('input', (e) => {
  const newText = e.target.value || ' '
  const oldTex = material.uniforms.uTexture.value
  const next = createTextTexture(newText)
  material.uniforms.uTexture.value = next.texture
  material.uniforms.uWaveOrigin.value.set(next.firstCenterWorldX, 0)
  if (oldTex) oldTex.dispose()
})
