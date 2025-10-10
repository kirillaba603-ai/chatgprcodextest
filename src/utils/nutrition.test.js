import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeNutrition, baseTotals, calculateTotals, scaleFoodEntry } from './nutrition.js';

test('scales nutrient values relative to quantity', () => {
  const food = { calories: 200, protein: 10, fat: 5, carbs: 30, fiber: 4, sugar: 12 };
  const scaled = scaleFoodEntry(food, 150);

  assert.deepEqual(
    {
      caloriesPerPortion: Number(scaled.caloriesPerPortion.toFixed(6)),
      proteinPerPortion: Number(scaled.proteinPerPortion.toFixed(6)),
      fatPerPortion: Number(scaled.fatPerPortion.toFixed(6)),
      carbsPerPortion: Number(scaled.carbsPerPortion.toFixed(6)),
      fiberPerPortion: Number(scaled.fiberPerPortion.toFixed(6)),
      sugarPerPortion: Number(scaled.sugarPerPortion.toFixed(6))
    },
    {
      caloriesPerPortion: 300,
      proteinPerPortion: 15,
      fatPerPortion: 7.5,
      carbsPerPortion: 45,
      fiberPerPortion: 6,
      sugarPerPortion: 18
    }
  );
});

test('aggregates totals for a set of entries', () => {
  const entries = [
    { ...scaleFoodEntry({ calories: 100, protein: 5, fat: 2, carbs: 15, fiber: 3, sugar: 1 }, 200) },
    { ...scaleFoodEntry({ calories: 50, protein: 2, fat: 1, carbs: 8, fiber: 1, sugar: 2 }, 100) }
  ];

  const totals = calculateTotals(entries);

  assert.ok(Math.abs(totals.calories - 250) < 1e-6);
  assert.ok(Math.abs(totals.protein - 12) < 1e-6);
  assert.ok(Math.abs(totals.fat - 5) < 1e-6);
  assert.ok(Math.abs(totals.carbs - 38) < 1e-6);
  assert.ok(Math.abs(totals.fiber - 7) < 1e-6);
  assert.ok(Math.abs(totals.sugar - 4) < 1e-6);
});

test('provides a default message when totals are empty', () => {
  const analysis = analyzeNutrition(baseTotals);
  assert.equal(analysis.length, 1);
  assert.equal(analysis[0].icon, '✨');
});

test('flags sugar overload when above threshold', () => {
  const totals = {
    calories: 2100,
    protein: 120,
    fat: 80,
    carbs: 250,
    fiber: 15,
    sugar: 90
  };

  const analysis = analyzeNutrition(totals);
  const sugarMessage = analysis.find((item) => item.icon === '⚠️');
  assert.ok(sugarMessage);
  assert.ok(sugarMessage.title.includes('Сахара'));
});
