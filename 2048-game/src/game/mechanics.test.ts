// src/game/mechanics.test.ts
import { describe, it, expect } from 'vitest';
import * as Mechanics from './mechanics';
import { WALL } from '../constants/game';
import type { Cell, LockedCell, StickyCell, TemporaryCell } from '../types/types';

const L = (val: number): LockedCell => ({ type: 'locked', value: val });
const S = (val: number): StickyCell => ({ type: 'sticky', value: val });
const T = (limit: number, val: number = 0): TemporaryCell => ({ type: 'temporary', limit, value: val });

describe('Game Mechanics', () => {

    describe('Helpers', () => {
        it('should correctly identify cell types', () => {
            expect(Mechanics.isLocked(L(2))).toBe(true);
            expect(Mechanics.isSticky(S(2))).toBe(true);
            expect(Mechanics.isTemporary(T(1))).toBe(true);
            expect(Mechanics.isLocked(2)).toBe(false);
        });

        it('should extract values correctly', () => {
            expect(Mechanics.getCellValue(4)).toBe(4);
            expect(Mechanics.getCellValue(L(16))).toBe(16);
            expect(Mechanics.getCellValue(S(8))).toBe(8);
            expect(Mechanics.getCellValue(WALL)).toBe(0);
            expect(Mechanics.getCellValue(0)).toBe(0);
        });
    });

    describe('Merging Logic', () => {
        it('should allow merging matching numbers', () => {
            expect(Mechanics.canMerge(2, 2)).toBe(true);
            expect(Mechanics.canMerge(4, 2)).toBe(false);
        });

        it('should allow merging with negative counterparts', () => {
            expect(Mechanics.canMerge(2, -2)).toBe(true);
            expect(Mechanics.canMerge(-4, 4)).toBe(true);
        });

        it('should calculate merge results correctly', () => {
            expect(Mechanics.getMergeResult(2, 2)).toBe(4);
            expect(Mechanics.getMergeResult(4, 4)).toBe(8);
            // Annihilation
            expect(Mechanics.getMergeResult(2, -2)).toBe(0);
        });
    });

    describe('Row Processing (Slide & Merge)', () => {
        // Note: processRow simulates a slide to the LEFT (index 0)

        it('should slide tiles to the left', () => {
            const input = [0, 0, 2, 0];
            const expected = [2, 0, 0, 0];
            expect(Mechanics.processRow(input)).toEqual(expected);
        });

        it('should merge tiles and slide to the left', () => {
            const input = [0, 2, 2, 0];
            const expected = [4, 0, 0, 0];
            expect(Mechanics.processRow(input)).toEqual(expected);
        });

        it('should prioritize left-most merges', () => {
            const input = [2, 2, 2, 0];
            const expected = [4, 2, 0, 0];
            expect(Mechanics.processRow(input)).toEqual(expected);
        });

        it('should process double merges in one row', () => {
            const input = [2, 2, 4, 4];
            const expected = [4, 8, 0, 0];
            expect(Mechanics.processRow(input)).toEqual(expected);
        });

        it('should respect walls', () => {
            const input: Cell[] = [2, WALL, 0, 2];
            const expected: Cell[] = [2, WALL, 2, 0];
            expect(Mechanics.processRow(input)).toEqual(expected);
        });
    });

    describe('Special Mechanics', () => {

        describe('Sticky Tiles', () => {
            it('should stop a sliding tile', () => {
                const input = [0, S(0), 2, 0];
                const expected = [0, S(2), 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });

            it('should NOT merge immediately when entering sticky', () => {
                const input = [0, S(2), 2, 0];
                const expected = [2, S(2), 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });

            it('should hold the tile for one turn (integration check)', () => {
                const input = [0, S(2), 0, 0];
                const expected = [2, S(0), 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });
        });

        describe('Locked Tiles', () => {
            it('should unlock when merged with matching number', () => {
                const input = [L(2), 2, 0, 0];
                const expected = [4, 0, 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });

            it('should trap a number if lock value is 0', () => {
                const input = [L(0), 4, 0, 0];
                const expected = [L(4), 0, 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });

            it('should NOT move', () => {
                const input = [0, L(2), 0, 0];
                const expected = [0, L(2), 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });

            it('should block movement behind it', () => {
                const input = [0, L(2), 0, 4];
                const expected = [0, L(2), 4, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });
        });

        describe('Temporary Tiles', () => {
            it('should decrement limit when tile passthrough', () => {
                const input = [0, T(2, 0), 4, 0];
                const expected = [4, T(1, 0), 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });
            it('should decrement limit when tile leaves', () => {
                const input = [0, T(2, 4), 0, 0];
                const expected = [4, T(1, 0), 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });
            it('shouldnt decrement limit when tile enters', () => {
                const input = [T(2, 0), 0, 2, 0];
                const expected = [T(2, 2), 0, 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });

            it('should turn to WALL when limit hits 0', () => {
                const input: Cell[] = [0, T(1, 4), 0, 0];
                const expected: Cell[] = [4, WALL, 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });

            it('should accept incoming tiles without changing limit', () => {
                const input = [T(2, 2), 2, 0, 0];
                const expected = [T(2, 4), 0, 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });
        });

        describe('Negative Tiles', () => {
            it('should annihilate positive numbers', () => {
                const input = [2, -2, 0, 0];
                const expected = [0, 0, 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });

            it('should merge two negatives', () => {
                const input = [-2, -2, 0, 0];
                const expected = [-4, 0, 0, 0];
                expect(Mechanics.processRow(input)).toEqual(expected);
            });
        });
    });
});