// Geometry regressions against the actual GLB consumed by both viewers.
// No browser/GPU needed; texture images are stubbed, not geometry or materials.
// Optional path argument lets this check older exports as well.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Box3, MathUtils, Raycaster, Texture, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const path = process.argv[2] ?? fileURLToPath(new URL('../public/models/Arai_Nimbus_S1_Concept.glb', import.meta.url));
const bytes = await readFile(path);
const loader = new GLTFLoader();
loader.register(() => ({
  // Replace the built-in WebP handler as well as texture loading; its browser
  // feature probe otherwise requires Image even when pixels are never used.
  name: 'EXT_texture_webp',
  loadTexture: async () => new Texture(),
}));
const { scene } = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
const name = (node) => node.name.replace(/_/g, ' ');
const nodes = [];
scene.traverse((node) => nodes.push(node));
const find = (prefix) => {
  const node = nodes.find((node) => name(node).startsWith(prefix));
  assert.ok(node, `Missing ${prefix}`);
  return node;
};
const hingeA = find('Hinge A |');
const hingeB = find('Hinge B |');
const deck = find('C-side |');
const cover = find('A-side |');
const bezel = find('B-side | matte display bezel');
const rearLogo = find('Arai logo | rear cover');
const bezelLogo = find('Arai logo | lower bezel');
const keys = nodes.filter((node) => name(node).startsWith('Key |'));
assert.equal(keys.length, 74, 'Keep all 74 Blender keycaps');
assert.ok(find('Legend | Ñ').isMesh, 'Spanish legends must be exported as meshes');
assert.equal(hingeB.parent, hingeA, 'Preserve the dual-axis hinge hierarchy');
assert.equal(rearLogo.parent, hingeB, 'Rear artwork must follow the lid');
assert.equal(bezelLogo.parent, hingeB, 'Bezel artwork must follow the lid');

const ray = new Raycaster();
const down = new Vector3(0, -1, 0);
const position = new Vector3();
const restKeyPositions = keys.map((key) => key.getWorldPosition(new Vector3()));
for (const [a, b] of [[0, 0], [0, -112], [-140, -145], [-120, -140], [-180, -180], [0, -112]]) {
  hingeA.rotation.x = MathUtils.degToRad(a);
  hingeB.rotation.x = MathUtils.degToRad(b);
  scene.updateMatrixWorld(true);
  keys.forEach((key, i) => {
    assert.ok(key.getWorldPosition(position).distanceTo(restKeyPositions[i]) < 1e-5, 'Keys must stay attached to the base in every fold mode');
  });
}

// A vertical ray must hit each key BEFORE the deck or open lid. The old GLB
// contained keycaps at Y=13.25 hidden below an uncut deck at Y=13.4.
for (const key of keys) {
  key.getWorldPosition(position);
  ray.set(new Vector3(position.x, 500, position.z), down);
  const hits = ray.intersectObjects([key, deck, cover, bezel], false);
  assert.ok(hits[0]?.object === key, `${name(key)} is occluded by ${hits[0]?.object.name}`);
}
const touchpad = find('Centered touchpad |');
touchpad.getWorldPosition(position);
ray.set(new Vector3(position.x, 500, position.z), down);
assert.equal(ray.intersectObjects([touchpad, deck], false)[0]?.object, touchpad, 'Bake the touchpad recess too');

// In glTF UVs, v=0 is the top of the image. Both wordmarks must point UP
// in world space with the display open, without flipping the shared texture.
for (const logo of [rearLogo, bezelLogo]) {
  const positions = logo.geometry.attributes.position;
  const uv = logo.geometry.attributes.uv;
  const top = new Vector3();
  const bottom = new Vector3();
  let topCount = 0;
  let bottomCount = 0;
  for (let i = 0; i < uv.count; i++) {
    const point = new Vector3().fromBufferAttribute(positions, i);
    if (uv.getY(i) < 0.5) { top.add(point); topCount++; }
    else { bottom.add(point); bottomCount++; }
  }
  logo.localToWorld(top.divideScalar(topCount));
  logo.localToWorld(bottom.divideScalar(bottomCount));
  assert.ok(top.sub(bottom).normalize().y > 0.9, `${name(logo)} is upside down at 112°`);
}
const spine = find('Hinge | continuous center spine');
assert.equal(spine.parent, hingeA, 'The center barrel follows the lower spindle, not the base');
// Look straight through the former daylight gap above the deck and between
// the two hinges. This must hit real geometry, not an overlay in the viewer.
for (const x of [-95, -60, 0, 60, 95]) {
  for (const y of [14, 15, 16, 17]) {
    ray.set(new Vector3(x, y, 500), new Vector3(0, 0, -1));
    assert.ok(ray.intersectObjects([spine, cover, bezel], false).length > 0, `Open hinge gap at X=${x}, Y=${y}`);
  }
}
const wordmark = find('Rear lid secondary mark');
const chrome = find('Chrome logo | lid artwork control');
const lockup = find('Chromebook lockup | upright lid artwork');
assert.equal(wordmark.parent, lockup);
assert.equal(chrome.parent, lockup);
assert.equal(lockup.parent, hingeB);
assert.ok(new Vector3(0, 0, -1).transformDirection(wordmark.matrixWorld).y > 0.9, 'Chromebook wordmark is upside down');
const iconCenter = new Box3().setFromObject(chrome).getCenter(new Vector3());
const textCenter = new Box3().setFromObject(wordmark).getCenter(new Vector3());
assert.ok(iconCenter.x > textCenter.x, 'Chrome icon must stay left of its upright wordmark when seen from behind');
assert.ok(!nodes.some((node) => /^(TOOL|Studio ground|REF |CONTROL)/.test(name(node))), 'Do not export CAD cutters or studio helpers');
console.log('Model OK: 74 visible keys, Ñ, touchpad, upright ARAI/Chromebook artwork, continuous hinge spine and five fold modes.');
