import test from "node:test";
import { strict as assert } from 'node:assert';
import { analyzeFoodPhoto, __internal } from './photo.js';

test('analyzeFoodPhoto recognises foods from english filenames', () => {
  const result = analyzeFoodPhoto({ filename: 'lunch_salmon_avocado_plate.jpg' });
  const names = result.map((item) => item.name);
  assert.ok(names.includes('Лосось'));
  assert.ok(names.includes('Авокадо'));
});

test('analyzeFoodPhoto uses hints to improve detection and quantity', () => {
  const result = analyzeFoodPhoto({
    filename: 'smoothie.png',
    hints: 'большой зелёный смузи с бананом',
    labels: ['healthy', 'smoothie']
  });
  const smoothie = result.find((item) => item.name === 'Зелёный смузи');
  assert.ok(smoothie, 'smoothie must be detected');
  assert.ok(smoothie.quantity > 260, 'quantity should be adjusted for a big smoothie');
  assert.ok(smoothie.confidence >= 0.6 && smoothie.confidence <= 0.95, 'confidence is in range');
});

test('analyzeFoodPhoto gracefully falls back to leafy greens for salads', () => {
  const result = analyzeFoodPhoto({ hints: 'Большой салат с шпинатом и киноа' });
  const spinach = result.find((item) => item.name === 'Шпинат');
  assert.ok(spinach, 'spinach should be suggested when salad is mentioned');
  assert.ok(spinach.quantity >= 120, 'quantity should be scaled for big salad');
});

test('combineText normalises separators', () => {
  const value = __internal.combineText('IMG_apple-photo.png', 'Свежий  яблочный   перекус');
  assert.equal(value, 'img apple photo png свежий яблочный перекус');
});

test('applyQuantityAdjustments reacts to descriptors', () => {
  const base = 100;
  const big = __internal.applyQuantityAdjustments(base, 'big double portion');
  assert.equal(big, 252);
  const small = __internal.applyQuantityAdjustments(base, 'mini snack');
  assert.equal(small, 75);
});

