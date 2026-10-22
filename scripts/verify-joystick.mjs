// Mock-test: camera-relative joystick mapping. Up must move toward camera-forward (-Z at yaw=0).
import assert from 'node:assert/strict';
function mapInput(x,y,yaw){const forward=-y*.32,strafe=x*.32;return {x:strafe*Math.cos(yaw)-forward*Math.sin(yaw),z:-forward*Math.cos(yaw)-strafe*Math.sin(yaw)};}
const eps=1e-9;
let v=mapInput(0,-1,0); assert.ok(v.z < 0, 'up must move forward (-Z) when yaw=0');
v=mapInput(0,1,0); assert.ok(v.z > 0, 'down must move backward (+Z) when yaw=0');
v=mapInput(-1,0,0); assert.ok(v.x < 0, 'left must move left (-X) when yaw=0');
v=mapInput(1,0,0); assert.ok(v.x > 0, 'right must move right (+X) when yaw=0');
v=mapInput(0,-1,Math.PI/2); assert.ok(v.x < 0 && Math.abs(v.z)<eps, 'up follows camera yaw');
v=mapInput(1,-1,0); assert.ok(v.x>0 && v.z<0, 'diagonal up-right works');
console.log('Joystick mapping mock tests: 6/6 passed');
