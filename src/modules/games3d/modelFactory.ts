import * as THREE from 'three';

export type SceneTheme = 'park' | 'lake' | 'stage' | 'garden';
export type CharacterPosture = 'stand' | 'vivo_jump' | 'morto_crouch' | 'celebrate';

interface CharacterLookSpec {
  skin: number;
  shirt: number;
  pants: number;
  hair: number;
  shoeAccent: number;
  hairStyle: 'bia_pigtails' | 'leo_curls' | 'nina_long_band' | 'davi_glasses' | 'lara_puffs' | 'tico_cap' | 'mestre_royal';
  hasSkirt?: boolean;
  accessoryColor?: number;
}

const CHARACTER_SPECS: Record<string, CharacterLookSpec> = {
  bia: {
    skin: 0xFDE2C8,
    shirt: 0x83BCE0,
    pants: 0x303D63,
    hair: 0x303D63,
    shoeAccent: 0xF3D9DE,
    hairStyle: 'bia_pigtails',
    hasSkirt: true,
    accessoryColor: 0xF472B6
  },
  leo: {
    skin: 0xE6B98F,
    shirt: 0x97C087,
    pants: 0x303D63,
    hair: 0x303D63,
    shoeAccent: 0xD7E995,
    hairStyle: 'leo_curls',
    accessoryColor: 0x97C087
  },
  nina: {
    skin: 0xFDE4CE,
    shirt: 0xD89BA7,
    pants: 0x4C3B6E,
    hair: 0x8C4A32,
    shoeAccent: 0xF4E9A9,
    hairStyle: 'nina_long_band',
    hasSkirt: true,
    accessoryColor: 0xF4E9A9
  },
  davi: {
    skin: 0xF9D5B3,
    shirt: 0xB697D8,
    pants: 0x303D63,
    hair: 0x303D63,
    shoeAccent: 0xC8E0F3,
    hairStyle: 'davi_glasses',
    accessoryColor: 0x303D63
  },
  lara: {
    skin: 0xC68B59,
    shirt: 0xDEC159,
    pants: 0x303D63,
    hair: 0x26263A,
    shoeAccent: 0xF4E9A9,
    hairStyle: 'lara_puffs',
    hasSkirt: true,
    accessoryColor: 0xFACC15
  },
  tico: {
    skin: 0xFCD7B0,
    shirt: 0x62A8D8,
    pants: 0x303D63,
    hair: 0x6B3E26,
    shoeAccent: 0x83BCE0,
    hairStyle: 'tico_cap',
    accessoryColor: 0x83BCE0
  },
  mestre: {
    skin: 0xFDE2C8,
    shirt: 0x303D63,
    pants: 0x242E4B,
    hair: 0x9E5A28,
    shoeAccent: 0xFACC15,
    hairStyle: 'mestre_royal',
    accessoryColor: 0xFACC15
  }
};

function resolveCharacterSpec(name: string, shirtColorHex: number, hairColorHex: number): CharacterLookSpec {
  const clean = (name || '').trim().toLowerCase();
  const key = Object.keys(CHARACTER_SPECS).find(k => clean.includes(k));
  if (key) {
    const base = CHARACTER_SPECS[key];
    return {
      ...base,
      shirt: shirtColorHex || base.shirt,
      hair: hairColorHex || base.hair
    };
  }
  return {
    skin: 0xFCD7B0,
    shirt: shirtColorHex,
    pants: 0x303D63,
    hair: hairColorHex,
    shoeAccent: 0x83BCE0,
    hairStyle: 'leo_curls',
    accessoryColor: 0xF4E9A9
  };
}

/**
 * Generates an expressive, non-clipping, stylized 3D character matching each 2D Ajuda KIDS avatar.
 */
export function createKidCharacter3D(name: string, shirtColorHex: number, hairColorHex: number): THREE.Group {
  const spec = resolveCharacterSpec(name, shirtColorHex, hairColorHex);
  const group = new THREE.Group();
  group.name = `kid_${name}`;

  const skinMat = new THREE.MeshStandardMaterial({ color: spec.skin, roughness: 0.62, metalness: 0.02 });
  const hairMat = new THREE.MeshStandardMaterial({ color: spec.hair, roughness: 0.58, metalness: 0.04 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: spec.shirt, roughness: 0.52, metalness: 0.05 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: spec.pants, roughness: 0.58, metalness: 0.04 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.45, metalness: 0.02 });
  const navyMat = new THREE.MeshStandardMaterial({ color: 0x303D63, roughness: 0.4, metalness: 0.05 });
  const accMat = new THREE.MeshStandardMaterial({ color: spec.accessoryColor || 0xF4E9A9, roughness: 0.42, metalness: 0.08 });
  const shoeAccentMat = new THREE.MeshStandardMaterial({ color: spec.shoeAccent, roughness: 0.45, metalness: 0.05 });

  // Soft ground contact shadow for crisp spatial grounding
  const shadowGeo = new THREE.CircleGeometry(0.42, 24);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x162238,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.name = 'contactShadow';
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.015;
  group.add(contactShadow);

  const upperBody = new THREE.Group();
  upperBody.name = 'upperBody';
  group.add(upperBody);

  // 1. Sculpted Head & Neck (zero z-fighting tolerances)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.18, 16), skinMat);
  neck.position.set(0, 1.19, 0);
  upperBody.add(neck);

  const headRadius = 0.41;
  const headCenterY = 1.54;
  const head = new THREE.Mesh(new THREE.SphereGeometry(headRadius, 32, 24), skinMat);
  head.position.set(0, headCenterY, 0);
  head.scale.set(1.04, 0.98, 0.96);
  head.castShadow = true;
  upperBody.add(head);

  const earGeo = new THREE.SphereGeometry(0.095, 14, 12);
  const earL = new THREE.Mesh(earGeo, skinMat);
  earL.position.set(-0.42, headCenterY - 0.01, -0.02);
  const earR = new THREE.Mesh(earGeo, skinMat);
  earR.position.set(0.42, headCenterY - 0.01, -0.02);
  upperBody.add(earL, earR);

  // 2. Character-Specific Sculpted Hair & Accessories (positioned cleanly outside cranium)
  const hairBackCap = (radius = 0.445, thetaLen = Math.PI * 0.58, tiltX = -0.35) => {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 28, 18, 0, Math.PI * 2, 0, thetaLen),
      hairMat
    );
    cap.position.set(0, headCenterY + 0.015, -0.035);
    cap.rotation.x = tiltX;
    cap.castShadow = true;
    upperBody.add(cap);
    return cap;
  };

  if (spec.hairStyle === 'bia_pigtails') {
    hairBackCap(0.445, Math.PI * 0.58, -0.36);
    // Clean forehead bangs
    const bangL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), hairMat);
    bangL.scale.set(1.15, 0.58, 0.65);
    bangL.position.set(-0.15, headCenterY + 0.31, 0.25);
    const bangR = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), hairMat);
    bangR.scale.set(1.15, 0.58, 0.65);
    bangR.position.set(0.15, headCenterY + 0.31, 0.25);
    upperBody.add(bangL, bangR);

    // Side high pigtails + pink scrunchies outside head sphere
    [-1, 1].forEach(side => {
      const tie = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.035, 10, 16), accMat);
      tie.position.set(side * 0.45, headCenterY + 0.16, -0.05);
      tie.rotation.y = side * (Math.PI / 2.2);
      const tailTop = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 14), hairMat);
      tailTop.position.set(side * 0.52, headCenterY + 0.18, -0.08);
      const tailDrop = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.16, 8, 14), hairMat);
      tailDrop.position.set(side * 0.56, headCenterY + 0.03, -0.1);
      tailDrop.rotation.z = side * -0.25;
      upperBody.add(tie, tailTop, tailDrop);
    });
  } else if (spec.hairStyle === 'leo_curls') {
    hairBackCap(0.442, Math.PI * 0.52, -0.45);
    // Curly puffs along hairline & top (masculine playful curls, zero pigtails)
    const curlCoords: [number, number, number, number][] = [
      [-0.22, headCenterY + 0.36, 0.16, 0.15],
      [-0.06, headCenterY + 0.43, 0.12, 0.17],
      [0.12, headCenterY + 0.41, 0.13, 0.16],
      [0.25, headCenterY + 0.33, 0.14, 0.14],
      [-0.14, headCenterY + 0.44, -0.06, 0.16],
      [0.10, headCenterY + 0.45, -0.08, 0.17]
    ];
    curlCoords.forEach(([cx, cy, cz, cr]) => {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(cr, 16, 12), hairMat);
      curl.position.set(cx, cy, cz);
      curl.castShadow = true;
      upperBody.add(curl);
    });
  } else if (spec.hairStyle === 'nina_long_band') {
    hairBackCap(0.445, Math.PI * 0.6, -0.32);
    // Long flowing back locks
    const backMane = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.34, 10, 16), hairMat);
    backMane.scale.set(1.22, 1.0, 0.55);
    backMane.position.set(0, headCenterY - 0.18, -0.28);
    upperBody.add(backMane);
    [-1, 1].forEach(side => {
      const sideLock = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.24, 8, 12), hairMat);
      sideLock.position.set(side * 0.36, headCenterY - 0.18, -0.06);
      upperBody.add(sideLock);
    });
    // Pastel yellow headband
    const headband = new THREE.Mesh(
      new THREE.TorusGeometry(0.435, 0.042, 12, 28, Math.PI * 1.15),
      accMat
    );
    headband.position.set(0, headCenterY + 0.04, 0.04);
    headband.rotation.z = -Math.PI * 0.075;
    headband.rotation.x = -0.35;
    upperBody.add(headband);
  } else if (spec.hairStyle === 'davi_glasses') {
    hairBackCap(0.442, Math.PI * 0.54, -0.4);
    // Swept boyish topete bangs
    const topete = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), hairMat);
    topete.scale.set(1.45, 0.52, 0.9);
    topete.position.set(0.05, headCenterY + 0.36, 0.16);
    topete.rotation.z = -0.18;
    upperBody.add(topete);

    // Signature round 3D glasses perched cleanly in front of eyes
    const glassFrameMat = navyMat;
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0xE8F6FF,
      transparent: true,
      opacity: 0.42,
      roughness: 0.1,
      metalness: 0.1
    });
    [-0.145, 0.145].forEach(gx => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.018, 10, 22), glassFrameMat);
      rim.position.set(gx, headCenterY + 0.01, 0.43);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.095, 18), lensMat);
      lens.position.set(gx, headCenterY + 0.01, 0.428);
      upperBody.add(rim, lens);
    });
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.09, 8), glassFrameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, headCenterY + 0.02, 0.43);
    upperBody.add(bridge);
  } else if (spec.hairStyle === 'lara_puffs') {
    hairBackCap(0.445, Math.PI * 0.58, -0.32);
    // High twin afro puffs + golden clips
    [-1, 1].forEach(side => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.21, 18, 16), hairMat);
      puff.position.set(side * 0.34, headCenterY + 0.35, -0.03);
      puff.castShadow = true;
      const clip = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.026, 10, 16), accMat);
      clip.position.set(side * 0.27, headCenterY + 0.25, 0.02);
      clip.rotation.set(0.4, side * 0.5, side * -0.4);
      upperBody.add(puff, clip);
    });
  } else if (spec.hairStyle === 'tico_cap') {
    hairBackCap(0.438, Math.PI * 0.52, -0.45);
    // Sporty baseball cap + front brim
    const capDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
      accMat
    );
    capDome.position.set(0, headCenterY + 0.07, -0.01);
    capDome.rotation.x = -0.15;
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.035, 18, 1, false, -Math.PI / 2, Math.PI), navyMat);
    brim.position.set(0, headCenterY + 0.19, 0.25);
    brim.rotation.y = Math.PI / 2;
    brim.rotation.x = 0.08;
    const capButton = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), navyMat);
    capButton.position.set(0, headCenterY + 0.52, -0.02);
    upperBody.add(capDome, brim, capButton);
  } else if (spec.hairStyle === 'mestre_royal') {
    hairBackCap(0.44, Math.PI * 0.54, -0.4);
    const goldMat = accMat;
    const epauletteL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), goldMat);
    epauletteL.scale.set(1.2, 0.6, 1.0);
    epauletteL.position.set(-0.37, 1.11, 0);
    const epauletteR = epauletteL.clone();
    epauletteR.position.set(0.37, 1.11, 0);
    upperBody.add(epauletteL, epauletteR);
  }

  // 3. Expressive Face (clear offset along +Z to prevent any surface clipping)
  [-1, 1].forEach(side => {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 12), whiteMat);
    sclera.scale.set(1.0, 1.1, 0.45);
    sclera.position.set(side * 0.145, headCenterY + 0.01, 0.375);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 12), navyMat);
    iris.scale.set(1.0, 1.05, 0.45);
    iris.position.set(side * 0.145, headCenterY + 0.01, 0.398);

    const sparkle = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), whiteMat);
    sparkle.position.set(side * 0.145 + 0.014, headCenterY + 0.026, 0.415);

    // Subtle eyelids for blinking
    const eyelid = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 10), skinMat);
    eyelid.name = side === -1 ? 'eyelidL' : 'eyelidR';
    eyelid.scale.set(1.08, 0.05, 0.5);
    eyelid.position.set(side * 0.145, headCenterY + 0.06, 0.388);

    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.065, 6, 8), hairMat);
    brow.rotation.z = Math.PI / 2 + side * -0.14;
    brow.position.set(side * 0.145, headCenterY + 0.115, 0.39);

    const cheek = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xF5B5C0 })
    );
    cheek.scale.set(1.25, 0.75, 0.35);
    cheek.position.set(side * 0.245, headCenterY - 0.085, 0.345);

    upperBody.add(sclera, iris, sparkle, eyelid, brow, cheek);
  });

  // Soft Nose & Friendly Smile
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), skinMat);
  nose.position.set(0, headCenterY - 0.055, 0.405);
  upperBody.add(nose);

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.018, 10, 18, Math.PI), navyMat);
  smile.rotation.x = Math.PI;
  smile.position.set(0, headCenterY - 0.125, 0.382);
  upperBody.add(smile);

  // 4. Rounded Torso Shirt + Collar + Optional Skirt Rim
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.38, 0.62, 24), shirtMat);
  body.position.y = 0.84;
  body.castShadow = true;
  upperBody.add(body);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 10, 22), whiteMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.14;
  upperBody.add(collar);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.39, 0.08, 24), pantsMat);
  belt.position.y = 0.55;
  upperBody.add(belt);

  if (spec.hasSkirt) {
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.48, 0.22, 24), pantsMat);
    skirt.position.y = 0.46;
    skirt.castShadow = true;
    upperBody.add(skirt);
  }

  // 5. Shoulder + Elbow Articulated Arms + Sleeves + Hands
  const createArm = (side: -1 | 1) => {
    const armPivot = new THREE.Group();
    armPivot.name = side === -1 ? 'armL' : 'armR';
    armPivot.position.set(side * 0.38, 1.07, 0);
    armPivot.rotation.z = side === -1 ? 0.22 : -0.22;

    const sleeve = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), shirtMat);
    sleeve.scale.set(1.0, 1.15, 1.0);
    sleeve.position.set(0, -0.04, 0);

    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.12, 8, 12), skinMat);
    upperArm.position.set(0, -0.14, 0);
    upperArm.castShadow = true;

    const elbowPivot = new THREE.Group();
    elbowPivot.name = side === -1 ? 'elbowL' : 'elbowR';
    elbowPivot.position.set(0, -0.22, 0);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.12, 8, 12), skinMat);
    forearm.position.set(0, -0.09, 0);
    forearm.castShadow = true;

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.088, 12, 10), skinMat);
    hand.position.set(0, -0.19, 0);

    elbowPivot.add(forearm, hand);
    armPivot.add(sleeve, upperArm, elbowPivot);
    return armPivot;
  };

  upperBody.add(createArm(-1), createArm(1));

  // 6. Hip + Knee + Ankle Articulated Legs + Socks + Two-Tone Sneakers
  const createLeg = (side: -1 | 1) => {
    const legGroup = new THREE.Group();
    legGroup.name = side === -1 ? 'legL' : 'legR';
    legGroup.position.set(side * 0.16, 0.54, 0);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.14, 8, 14), pantsMat);
    thigh.position.y = -0.11;
    thigh.castShadow = true;

    const kneePivot = new THREE.Group();
    kneePivot.name = side === -1 ? 'kneeL' : 'kneeR';
    kneePivot.position.set(0, -0.23, 0);

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.09, 8, 12), pantsMat);
    shin.position.y = -0.05;

    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.086, 0.12, 14), whiteMat);
    sock.position.y = -0.13;

    const anklePivot = new THREE.Group();
    anklePivot.name = side === -1 ? 'ankleL' : 'ankleR';
    anklePivot.position.set(0, -0.19, 0);

    const sneakerBody = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.11, 0.3), shoeAccentMat);
    sneakerBody.position.set(0, -0.025, 0.045);
    sneakerBody.castShadow = true;

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.045, 0.31), whiteMat);
    sole.position.set(0, -0.085, 0.045);

    anklePivot.add(sneakerBody, sole);
    kneePivot.add(shin, sock, anklePivot);
    legGroup.add(thigh, kneePivot);
    return legGroup;
  };

  group.add(createLeg(-1), createLeg(1));

  return group;
}

/**
 * Sets sitting vs standing posture cleanly for circle park games with knee & hip bend.
 */
export function setCharacterSeated(group: THREE.Group, seated: boolean): void {
  const upperBody = group.getObjectByName('upperBody');
  const legL = group.getObjectByName('legL');
  const legR = group.getObjectByName('legR');
  const kneeL = group.getObjectByName('kneeL');
  const kneeR = group.getObjectByName('kneeR');
  const ankleL = group.getObjectByName('ankleL');
  const ankleR = group.getObjectByName('ankleR');
  const armL = group.getObjectByName('armL');
  const armR = group.getObjectByName('armR');
  const elbowL = group.getObjectByName('elbowL');
  const elbowR = group.getObjectByName('elbowR');
  if (!upperBody || !legL || !legR) return;

  if (seated) {
    upperBody.position.y = -0.35;
    upperBody.rotation.x = 0.08;
    legL.position.set(-0.17, 0.22, 0.04);
    legR.position.set(0.17, 0.22, 0.04);
    legL.rotation.x = -Math.PI / 2.15;
    legR.rotation.x = -Math.PI / 2.15;
    legL.rotation.y = 0.22;
    legR.rotation.y = -0.22;
    if (kneeL && kneeR) {
      kneeL.rotation.x = 0.65;
      kneeR.rotation.x = 0.65;
    }
    if (ankleL && ankleR) {
      ankleL.rotation.x = 0.25;
      ankleR.rotation.x = 0.25;
    }
    if (armL && armR) {
      armL.rotation.set(-0.42, 0, 0.26);
      armR.rotation.set(-0.42, 0, -0.26);
    }
    if (elbowL && elbowR) {
      elbowL.rotation.x = -0.55;
      elbowR.rotation.x = -0.55;
    }
  } else {
    upperBody.position.y = 0;
    upperBody.rotation.x = 0;
    legL.position.set(-0.16, 0.54, 0);
    legR.position.set(0.16, 0.54, 0);
    legL.rotation.set(0, 0, 0);
    legR.rotation.set(0, 0, 0);
    if (kneeL && kneeR) {
      kneeL.rotation.x = 0;
      kneeR.rotation.x = 0;
    }
    if (ankleL && ankleR) {
      ankleL.rotation.x = 0;
      ankleR.rotation.x = 0;
    }
    if (armL && armR) {
      armL.rotation.set(0, 0, 0.22);
      armR.rotation.set(0, 0, -0.22);
    }
    if (elbowL && elbowR) {
      elbowL.rotation.x = 0;
      elbowR.rotation.x = 0;
    }
  }
}

function smoothStep01(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/**
 * Smoothly blends between running/standing (sitProgress = 0) and seated (sitProgress = 1)
 * using a natural two-stage crouch-bend -> sit-settle biomechanical curve.
 */
export function updateCharacterSitAndRun(
  group: THREE.Group,
  sitProgress: number,
  runPhase: number,
  isMoving: boolean,
  time = 0
): void {
  const s = Math.max(0, Math.min(1, sitProgress));
  const upperBody = group.getObjectByName('upperBody');
  const legL = group.getObjectByName('legL');
  const legR = group.getObjectByName('legR');
  const kneeL = group.getObjectByName('kneeL');
  const kneeR = group.getObjectByName('kneeR');
  const ankleL = group.getObjectByName('ankleL');
  const ankleR = group.getObjectByName('ankleR');
  const armL = group.getObjectByName('armL');
  const armR = group.getObjectByName('armR');
  const elbowL = group.getObjectByName('elbowL');
  const elbowR = group.getObjectByName('elbowR');
  const eyelidL = group.getObjectByName('eyelidL');
  const eyelidR = group.getObjectByName('eyelidR');
  const contactShadow = group.getObjectByName('contactShadow') as THREE.Mesh | undefined;
  if (!upperBody || !legL || !legR || !armL || !armR) return;

  // Periodic gentle eye blink
  if (eyelidL && eyelidR && time > 0) {
    const cycle = (time * 0.7) % 4.2;
    const isBlinking = cycle > 4.02;
    const lidScaleY = isBlinking ? 1.05 : 0.05;
    eyelidL.scale.y = lidScaleY;
    eyelidR.scale.y = lidScaleY;
  }

  const bounce = isMoving ? Math.abs(Math.sin(runPhase)) * 0.075 : Math.sin(time * 2.2) * 0.012;
  const runArmL = isMoving ? Math.sin(runPhase) * 0.72 : 0;
  const runArmR = isMoving ? -Math.sin(runPhase) * 0.72 : 0;
  const runLegL = isMoving ? -Math.sin(runPhase) * 0.68 : 0;
  const runLegR = isMoving ? Math.sin(runPhase) * 0.68 : 0;
  const runKneeL = isMoving ? Math.max(0, Math.sin(runPhase)) * 0.85 : 0;
  const runKneeR = isMoving ? Math.max(0, -Math.sin(runPhase)) * 0.85 : 0;
  const runAnkleL = isMoving ? -Math.sin(runPhase) * 0.25 : 0;
  const runAnkleR = isMoving ? Math.sin(runPhase) * 0.25 : 0;
  const runElbow = isMoving ? -0.65 : 0;

  // Multi-stage sit-down / stand-up curve:
  // Stage 1 (0..0.55): bend knees deep and lower hips while leaning slightly forward for balance
  // Stage 2 (0.55..1.0): extend legs forward onto grass and settle torso upright
  const bendPhase = smoothStep01(s / 0.55);
  const settlePhase = smoothStep01((s - 0.55) / 0.45);
  const sitKneeTarget = 1.32 * bendPhase * (1 - settlePhase) + 0.65 * settlePhase;
  const sitUpperRotX = 0.16 * bendPhase * (1 - settlePhase) + 0.08 * settlePhase;
  const sitHipDrop = -0.35 * (0.68 * bendPhase + 0.32 * settlePhase);
  const sitLegY = 0.54 - 0.32 * (0.65 * bendPhase + 0.35 * settlePhase);
  const sitLegX = (-Math.PI / 2.15) * (0.52 * bendPhase + 0.48 * settlePhase);
  const sitAnkleX = -0.35 * bendPhase * (1 - settlePhase) + 0.25 * settlePhase;

  const standWeight = 1 - Math.min(1, bendPhase * 0.85 + settlePhase * 0.15);

  upperBody.position.y = bounce * standWeight + sitHipDrop;
  upperBody.rotation.x = sitUpperRotX;

  legL.position.set(-0.16 - 0.01 * settlePhase, sitLegY, 0.04 * settlePhase);
  legR.position.set(0.16 + 0.01 * settlePhase, sitLegY, 0.04 * settlePhase);
  legL.rotation.x = runLegL * standWeight + sitLegX;
  legR.rotation.x = runLegR * standWeight + sitLegX;
  legL.rotation.y = 0.22 * settlePhase;
  legR.rotation.y = -0.22 * settlePhase;

  if (kneeL && kneeR) {
    kneeL.rotation.x = runKneeL * standWeight + sitKneeTarget;
    kneeR.rotation.x = runKneeR * standWeight + sitKneeTarget;
  }

  if (ankleL && ankleR) {
    ankleL.rotation.x = runAnkleL * standWeight + sitAnkleX;
    ankleR.rotation.x = runAnkleR * standWeight + sitAnkleX;
  }

  armL.rotation.x = runArmL * standWeight + -0.42 * s;
  armR.rotation.x = runArmR * standWeight + -0.42 * s;
  armL.rotation.z = 0.22 + 0.04 * s;
  armR.rotation.z = -0.22 - 0.04 * s;

  if (elbowL && elbowR) {
    elbowL.rotation.x = runElbow * standWeight + -0.55 * s;
    elbowR.rotation.x = runElbow * standWeight + -0.55 * s;
  }

  if (contactShadow) {
    const shadowScale = 1 + 0.18 * s - Math.max(0, bounce) * 1.1;
    contactShadow.scale.set(shadowScale, shadowScale, 1);
    const mat = contactShadow.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.22 - Math.max(0, bounce) * 0.55 + 0.04 * s;
  }
}

/**
 * Natural articulated 3D posture transitions WITHOUT ever squashing scale.y!
 * Uses full hip + knee + ankle counter-flexion so shoes remain planted cleanly at y = 0.
 */
export function setCharacterPosture(
  group: THREE.Group,
  posture: CharacterPosture,
  time: number,
  dt: number = 1 / 60
): void {
  const upperBody = group.getObjectByName('upperBody');
  const armL = group.getObjectByName('armL');
  const armR = group.getObjectByName('armR');
  const elbowL = group.getObjectByName('elbowL');
  const elbowR = group.getObjectByName('elbowR');
  const legL = group.getObjectByName('legL');
  const legR = group.getObjectByName('legR');
  const kneeL = group.getObjectByName('kneeL');
  const kneeR = group.getObjectByName('kneeR');
  const ankleL = group.getObjectByName('ankleL');
  const ankleR = group.getObjectByName('ankleR');
  const eyelidL = group.getObjectByName('eyelidL');
  const eyelidR = group.getObjectByName('eyelidR');
  const contactShadow = group.getObjectByName('contactShadow') as THREE.Mesh | undefined;
  if (!upperBody || !armL || !armR || !legL || !legR) return;

  if (eyelidL && eyelidR) {
    const blinkCycle = (time * 0.75) % 4.1;
    const lidScale = blinkCycle > 3.94 ? 1.05 : 0.05;
    eyelidL.scale.y = lidScale;
    eyelidR.scale.y = lidScale;
  }

  let targetUpperY = 0;
  let targetUpperRotX = 0;
  let targetLegY = 0.54;
  let targetLegRotX = 0;
  let targetKneeRotX = 0;
  let targetAnkleRotX = 0;
  let targetArmLX = 0;
  let targetArmRX = 0;
  let targetElbowRotX = 0;
  let targetArmLZ = 0.22;
  let targetArmRZ = -0.22;
  let targetShadowScale = 1.0;

  let targetUpperZ = 0;
  if (posture === 'morto_crouch') {
    // Deep squat with ankle counter-flexion so both soles remain flush with y = 0
    targetUpperY = -0.24;
    targetUpperZ = -0.06;
    targetUpperRotX = 0.24;
    targetLegY = 0.32;
    targetLegRotX = -1.32;
    targetKneeRotX = 2.02;
    targetAnkleRotX = -0.70;
    targetArmLX = -0.82;
    targetArmRX = -0.82;
    targetElbowRotX = -0.65;
    targetArmLZ = 0.25;
    targetArmRZ = -0.25;
    targetShadowScale = 1.18;
  } else if (posture === 'vivo_jump') {
    const hop = Math.abs(Math.sin(time * 7.2)) * 0.28;
    targetUpperY = hop;
    targetUpperRotX = -0.04;
    targetLegY = 0.54 + hop;
    targetLegRotX = hop > 0.14 ? -0.18 : 0;
    targetKneeRotX = hop > 0.14 ? 0.35 : 0;
    targetAnkleRotX = hop > 0.14 ? 0.18 : 0;
    targetArmLX = 0;
    targetArmRX = 0;
    targetElbowRotX = -0.2;
    targetArmLZ = 2.35;
    targetArmRZ = -2.35;
    targetShadowScale = 1.0 - hop * 0.65;
  } else if (posture === 'celebrate') {
    const hop = Math.abs(Math.sin(time * 6.0)) * 0.16;
    targetUpperY = hop;
    targetLegY = 0.54 + hop;
    targetElbowRotX = -0.35;
    targetArmLZ = 2.2 + Math.sin(time * 9) * 0.25;
    targetArmRZ = -2.2 - Math.sin(time * 9) * 0.25;
    targetShadowScale = 1.0 - hop * 0.5;
  } else {
    targetUpperY = Math.sin(time * 2.4) * 0.015;
    targetLegY = 0.54;
    targetArmLZ = 0.22 + Math.sin(time * 2.4) * 0.04;
    targetArmRZ = -0.22 - Math.sin(time * 2.4) * 0.04;
  }

  const clampDt = Math.max(0.001, Math.min(0.05, dt));
  const lerp = 1 - Math.exp(-15 * clampDt);
  upperBody.position.y += (targetUpperY - upperBody.position.y) * lerp;
  upperBody.position.z += (targetUpperZ - upperBody.position.z) * lerp;
  upperBody.rotation.x += (targetUpperRotX - upperBody.rotation.x) * lerp;
  legL.position.y += (targetLegY - legL.position.y) * lerp;
  legR.position.y += (targetLegY - legR.position.y) * lerp;
  legL.rotation.x += (targetLegRotX - legL.rotation.x) * lerp;
  legR.rotation.x += (targetLegRotX - legR.rotation.x) * lerp;

  if (kneeL && kneeR) {
    kneeL.rotation.x += (targetKneeRotX - kneeL.rotation.x) * lerp;
    kneeR.rotation.x += (targetKneeRotX - kneeR.rotation.x) * lerp;
  }

  if (ankleL && ankleR) {
    ankleL.rotation.x += (targetAnkleRotX - ankleL.rotation.x) * lerp;
    ankleR.rotation.x += (targetAnkleRotX - ankleR.rotation.x) * lerp;
  }

  armL.rotation.x += (targetArmLX - armL.rotation.x) * lerp;
  armR.rotation.x += (targetArmRX - armR.rotation.x) * lerp;
  armL.rotation.z += (targetArmLZ - armL.rotation.z) * lerp;
  armR.rotation.z += (targetArmRZ - armR.rotation.z) * lerp;

  if (elbowL && elbowR) {
    elbowL.rotation.x += (targetElbowRotX - elbowL.rotation.x) * lerp;
    elbowR.rotation.x += (targetElbowRotX - elbowR.rotation.x) * lerp;
  }

  if (contactShadow) {
    const nextScale = contactShadow.scale.x + (targetShadowScale - contactShadow.scale.x) * lerp;
    contactShadow.scale.set(nextScale, nextScale, 1);
  }
}

/**
 * Animates arms, elbows, legs, knees, and ankles for playful walking/running cycles.
 */
export function animateCharacterRun(group: THREE.Group, phase: number, isMoving = true): void {
  const upperBody = group.getObjectByName('upperBody');
  const armL = group.getObjectByName('armL');
  const armR = group.getObjectByName('armR');
  const elbowL = group.getObjectByName('elbowL');
  const elbowR = group.getObjectByName('elbowR');
  const legL = group.getObjectByName('legL');
  const legR = group.getObjectByName('legR');
  const kneeL = group.getObjectByName('kneeL');
  const kneeR = group.getObjectByName('kneeR');
  const ankleL = group.getObjectByName('ankleL');
  const ankleR = group.getObjectByName('ankleR');

  if (!isMoving) {
    if (armL && armR) {
      armL.rotation.x += (0 - armL.rotation.x) * 0.25;
      armR.rotation.x += (0 - armR.rotation.x) * 0.25;
      armL.rotation.z += (0.22 - armL.rotation.z) * 0.25;
      armR.rotation.z += (-0.22 - armR.rotation.z) * 0.25;
    }
    if (elbowL && elbowR) {
      elbowL.rotation.x += (0 - elbowL.rotation.x) * 0.25;
      elbowR.rotation.x += (0 - elbowR.rotation.x) * 0.25;
    }
    if (legL && legR) {
      legL.rotation.x += (0 - legL.rotation.x) * 0.25;
      legR.rotation.x += (0 - legR.rotation.x) * 0.25;
    }
    if (kneeL && kneeR) {
      kneeL.rotation.x += (0 - kneeL.rotation.x) * 0.25;
      kneeR.rotation.x += (0 - kneeR.rotation.x) * 0.25;
    }
    if (ankleL && ankleR) {
      ankleL.rotation.x += (0 - ankleL.rotation.x) * 0.25;
      ankleR.rotation.x += (0 - ankleR.rotation.x) * 0.25;
    }
    if (upperBody) {
      upperBody.position.y += (0 - upperBody.position.y) * 0.25;
    }
    return;
  }

  const bounce = Math.abs(Math.sin(phase)) * 0.08;
  if (upperBody) upperBody.position.y = bounce;
  if (armL && armR) {
    armL.rotation.x = Math.sin(phase) * 0.72;
    armR.rotation.x = -Math.sin(phase) * 0.72;
    armL.rotation.z = 0.22;
    armR.rotation.z = -0.22;
  }
  if (elbowL && elbowR) {
    elbowL.rotation.x = -0.65;
    elbowR.rotation.x = -0.65;
  }
  if (legL && legR) {
    legL.rotation.x = -Math.sin(phase) * 0.68;
    legR.rotation.x = Math.sin(phase) * 0.68;
  }
  if (kneeL && kneeR) {
    kneeL.rotation.x = Math.max(0, Math.sin(phase)) * 0.85;
    kneeR.rotation.x = Math.max(0, -Math.sin(phase)) * 0.85;
  }
  if (ankleL && ankleR) {
    ankleL.rotation.x = -Math.sin(phase) * 0.25;
    ankleR.rotation.x = Math.sin(phase) * 0.25;
  }
}

/**
 * Generates a stylized 3D Hot Potato character with glowing crown and eyes
 */
export function createPotato3D(): THREE.Group {
  const group = new THREE.Group();
  const potGeo = new THREE.SphereGeometry(0.45, 28, 22);
  potGeo.scale(1.22, 0.88, 0.92);

  const potMat = new THREE.MeshStandardMaterial({ color: 0xDF9A4F, roughness: 0.55, metalness: 0.04 });
  const potato = new THREE.Mesh(potGeo, potMat);
  potato.castShadow = true;
  group.add(potato);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x303D63 });
  const eyeGeo = new THREE.SphereGeometry(0.055, 10, 10);
  const e1 = new THREE.Mesh(eyeGeo, eyeMat);
  e1.position.set(-0.15, 0.1, 0.42);
  const e2 = new THREE.Mesh(eyeGeo, eyeMat);
  e2.position.set(0.15, 0.1, 0.42);
  group.add(e1, e2);

  const smileGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 12, Math.PI);
  const smile = new THREE.Mesh(smileGeo, eyeMat);
  smile.rotation.x = Math.PI;
  smile.position.set(0, -0.02, 0.43);
  group.add(smile);

  // Warm glowing star crown
  const auraGeo = new THREE.ConeGeometry(0.22, 0.42, 12);
  const auraMat = new THREE.MeshBasicMaterial({ color: 0xFACC15, transparent: true, opacity: 0.9 });
  const aura = new THREE.Mesh(auraGeo, auraMat);
  aura.position.set(0, 0.52, 0);
  group.add(aura);

  return group;
}

/**
 * Stylized multi-canopy 3D Park Tree with pastel blossoms
 */
export function createTree3D(): THREE.Group {
  const tree = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.45, 10);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7A5238, roughness: 0.8 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.72;
  trunk.castShadow = true;
  tree.add(trunk);

  const folMat = new THREE.MeshStandardMaterial({ color: 0x8CC999, roughness: 0.65 });
  const folMatLight = new THREE.MeshStandardMaterial({ color: 0xD7E995, roughness: 0.65 });

  const f1 = new THREE.Mesh(new THREE.SphereGeometry(0.92, 16, 14), folMat);
  f1.position.y = 1.92;
  f1.castShadow = true;
  tree.add(f1);

  const f2 = new THREE.Mesh(new THREE.SphereGeometry(0.68, 14, 12), folMatLight);
  f2.position.set(0.42, 2.32, 0.15);
  tree.add(f2);

  const f3 = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 12), folMat);
  f3.position.set(-0.42, 2.15, -0.15);
  tree.add(f3);

  const blossomGeo = new THREE.SphereGeometry(0.11, 8, 8);
  const blossomMat = new THREE.MeshBasicMaterial({ color: 0xF3D9DE });
  const b1 = new THREE.Mesh(blossomGeo, blossomMat);
  b1.position.set(0.55, 1.85, 0.65);
  const b2 = new THREE.Mesh(blossomGeo, blossomMat);
  b2.position.set(-0.45, 2.1, 0.55);
  tree.add(b1, b2);

  return tree;
}

/**
 * Cute 3D Pond Duckling swimming on the lake
 */
export function createDuckling3D(): THREE.Group {
  const duck = new THREE.Group();
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.5 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xF97316, roughness: 0.5 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x303D63 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), yellowMat);
  body.scale.set(1.25, 0.85, 0.95);
  body.position.y = 0.18;
  duck.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 12), yellowMat);
  head.position.set(0.22, 0.4, 0);
  duck.add(head);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 8), orangeMat);
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.4, 0.39, 0);
  duck.add(beak);

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), eyeMat);
  eyeL.position.set(0.32, 0.45, 0.1);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), eyeMat);
  eyeR.position.set(0.32, 0.45, -0.1);
  duck.add(eyeL, eyeR);

  return duck;
}

/**
 * Colorful park flowers tuft
 */
export function createFlowerCluster3D(petalColor = 0xF3D9DE): THREE.Group {
  const cluster = new THREE.Group();
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 0.35, 6),
    new THREE.MeshStandardMaterial({ color: 0x6BB07D, roughness: 0.7 })
  );
  stem.position.y = 0.17;
  cluster.add(stem);

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xFACC15 })
  );
  center.position.y = 0.36;
  cluster.add(center);

  const petalMat = new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.55 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), petalMat);
    petal.position.set(Math.cos(a) * 0.1, 0.35, Math.sin(a) * 0.1);
    cluster.add(petal);
  }
  return cluster;
}

/**
 * Soft 3D Cartoon Cloud
 */
export function createCloud3D(): THREE.Group {
  const cloud = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.85 });
  const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 14, 12), mat);
  const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 12), mat);
  c2.position.set(-0.55, -0.1, 0);
  const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 12), mat);
  c3.position.set(0.55, -0.12, 0);
  cloud.add(c1, c2, c3);
  return cloud;
}

/**
 * Builds rich horizon sky texture + drifting clouds + themed green terrain/pond/stage
 */
export function buildThemedBackdrop(scene: THREE.Scene, theme: SceneTheme): THREE.Group {
  const backdropGroup = new THREE.Group();
  backdropGroup.name = 'themedBackdrop';

  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 4;
  skyCanvas.height = 256;
  const ctx = skyCanvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    if (theme === 'stage') {
      grad.addColorStop(0, '#4E7BB8');
      grad.addColorStop(0.55, '#9DCBF0');
      grad.addColorStop(1, '#F3E9FF');
    } else if (theme === 'garden') {
      grad.addColorStop(0, '#72B7DE');
      grad.addColorStop(0.5, '#C8E9FA');
      grad.addColorStop(1, '#EFF9E6');
    } else {
      grad.addColorStop(0, '#6EB8E6');
      grad.addColorStop(0.58, '#C8E8FA');
      grad.addColorStop(1, '#E6F5E0');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 4, 256);
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyTex;
  }

  const hillMat = new THREE.MeshStandardMaterial({
    color: theme === 'stage' ? 0xC5DFBA : 0xB7DF9B,
    roughness: 0.85
  });
  const hill1 = new THREE.Mesh(new THREE.SphereGeometry(12, 24, 16), hillMat);
  hill1.scale.set(1.6, 0.25, 0.7);
  hill1.position.set(-7, -2.5, -13);
  const hill2 = new THREE.Mesh(new THREE.SphereGeometry(11, 24, 16), hillMat);
  hill2.scale.set(1.5, 0.24, 0.7);
  hill2.position.set(7, -2.6, -14);
  backdropGroup.add(hill1, hill2);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0xFDE047 })
  );
  sun.position.set(-8.5, 7.2, -14);
  backdropGroup.add(sun);

  const cloudPositions: [number, number, number, number][] = [
    [-6.5, 6.2, -11, 1.0],
    [1.8, 7.0, -13, 1.15],
    [7.2, 5.8, -10.5, 0.9]
  ];
  cloudPositions.forEach(([x, y, z, s], idx) => {
    const cloud = createCloud3D();
    cloud.position.set(x, y, z);
    cloud.scale.setScalar(s);
    cloud.userData = { baseX: x, speed: 0.12 + idx * 0.04, phase: idx * 1.4 };
    cloud.name = `skyCloud_${idx}`;
    backdropGroup.add(cloud);
  });

  if (theme === 'park' || theme === 'lake' || theme === 'garden') {
    const flowerColors = [0xF3D9DE, 0xE5D2F4, 0xF4E9A9, 0xC8E0F3];
    const flowerSpots: [number, number][] = [
      [-6.5, 3.2],
      [6.4, 2.8],
      [-5.8, -3.5],
      [5.9, -4.0],
      [0.8, -6.5],
      [-2.8, 5.8]
    ];
    flowerSpots.forEach(([fx, fz], i) => {
      const fl = createFlowerCluster3D(flowerColors[i % flowerColors.length]);
      fl.position.set(fx, 0, fz);
      backdropGroup.add(fl);
    });
  }

  scene.add(backdropGroup);
  return backdropGroup;
}
