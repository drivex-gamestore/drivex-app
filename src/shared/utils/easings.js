
const noop = (t) => t;

const mirrorEasing = (easing) => (p) =>
  p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2;

const reverseEasing = (easing) => (p) => 1 - easing(1 - p);

const calcBezier = (t, a1, a2) =>
  (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) * t;

const subdivisionPrecision = 0.0000001;
const subdivisionMaxIterations = 12;

function binarySubdivide(x, lowerBound, upperBound, mX1, mX2) {
  let currentX;
  let currentT;
  let i = 0;
  do {
    currentT = lowerBound + (upperBound - lowerBound) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - x;
    if (currentX > 0.0) {
      upperBound = currentT;
    } else {
      lowerBound = currentT;
    }
  } while (Math.abs(currentX) > subdivisionPrecision && ++i < subdivisionMaxIterations);
  return currentT;
}

export function cubicBezier(mX1, mY1, mX2, mY2) {
  if (mX1 === mY1 && mX2 === mY2) return noop;
  const getTForX = (aX) => binarySubdivide(aX, 0, 1, mX1, mX2);
  return (t) => (t === 0 || t === 1 ? t : calcBezier(getTForX(t), mY1, mY2));
}

const backOut = cubicBezier(0.33, 1.53, 0.69, 0.99);
const backIn = reverseEasing(backOut);
const backInOut = mirrorEasing(backIn);

const circIn = (p) => 1 - Math.sin(Math.acos(p));
const circOut = reverseEasing(circIn);
const circInOut = mirrorEasing(circIn);

const anticipate = (p) => {
  p *= 2;
  return p < 1 ? 0.5 * backIn(p) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
};

const easeIn = cubicBezier(0.42, 0, 1, 1);
const easeOut = cubicBezier(0, 0, 0.58, 1);
const easeInOut = cubicBezier(0.42, 0, 0.58, 1);

const builtInEasings = {
  linear: noop,
  easeIn,
  easeInOut,
  easeOut,
  circIn,
  circInOut,
  circOut,
  backIn,
  backInOut,
  backOut,
  anticipate,
};



export const easings = {
  linear: [0, 0, 1, 1],
  sineIn: [0.12, 0, 0.39, 0],
  sineOut: [0.61, 1, 0.88, 1],
  sineInOut: [0.37, 0, 0.63, 1],
  quadIn: [0.11, 0, 0.5, 0],
  quadOut: [0.5, 1, 0.89, 1],
  quadInOut: [0.45, 0, 0.55, 1],
  power1In: [0.11, 0, 0.5, 0],
  power1Out: [0.5, 1, 0.89, 1],
  power1InOut: [0.45, 0, 0.55, 1],
  cubicIn: [0.32, 0, 0.67, 0],
  cubicOut: [0.33, 1, 0.68, 1],
  cubicInOut: [0.65, 0, 0.35, 1],
  power2In: [0.32, 0, 0.67, 0],
  power2Out: [0.33, 1, 0.68, 1],
  power2InOut: [0.65, 0, 0.35, 1],
  quartIn: [0.5, 0, 0.75, 0],
  quartOut: [0.25, 1, 0.5, 1],
  quartInOut: [0.76, 0, 0.24, 1],
  power3In: [0.5, 0, 0.75, 0],
  power3Out: [0.25, 1, 0.5, 1],
  power3InOut: [0.76, 0, 0.24, 1],
  quintIn: [0.64, 0, 0.78, 0],
  quintOut: [0.22, 1, 0.36, 1],
  quintInOut: [0.83, 0, 0.17, 1],
  power4In: [0.64, 0, 0.78, 0],
  power4Out: [0.22, 1, 0.36, 1],
  power4InOut: [0.83, 0, 0.17, 1],
  expoIn: [0.7, 0, 0.84, 0],
  expoOut: [0.16, 1, 0.3, 1],
  expoInOut: [0.87, 0, 0.13, 1],
  expo: [0.87, 0, 0.13, 1],
  circIn: [0.55, 0, 1, 0.45],
  circOut: [0, 0.55, 0.45, 1],
  circInOut: [0.85, 0, 0.15, 1],
  backIn: [0.36, 0, 0.66, -0.56],
  backOut: [0.34, 1.56, 0.64, 1],
  backInOut: [0.68, -0.6, 0.32, 1.6],
  backInOutSubtle: [0.68, -0.3, 0.32, 1.1],
  smooth: [0.25, 0.1, 0.25, 1],
};


const presetFunctionCache = new Map();

function resolvePreset(name) {
  if (presetFunctionCache.has(name)) return presetFunctionCache.get(name);
  const def = easings[name];
  const fn = cubicBezier(def[0], def[1], def[2], def[3]);
  presetFunctionCache.set(name, fn);
  return fn;
}

export const isBezierDefinition = (val) =>
  Array.isArray(val) && typeof val[0] === "number";


export function easingDefinitionToFunction(definition) {
  if (isBezierDefinition(definition)) {
    if (definition.length !== 4) {
      throw new Error("Cubic bezier arrays must contain four numerical values.");
    }
    const [x1, y1, x2, y2] = definition;
    return cubicBezier(x1, y1, x2, y2);
  }
  if (typeof definition === "string") {
    if (builtInEasings[definition]) return builtInEasings[definition];
    if (easings[definition]) return resolvePreset(definition);
    throw new Error(`Invalid easing type '${definition}'`);
  }
  return definition;
}

export const ease = easingDefinitionToFunction;
