// src/services/customLevelsStorage.ts
import type { CustomLevel } from '../types/editorTypes';

const STORAGE_KEY = 'target2048_custom_levels';

// Get all custom levels for a user
export const getUserLevels = (username: string): CustomLevel[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    const allLevels: CustomLevel[] = JSON.parse(data);
    return allLevels.filter(level => level.createdBy === username);
  } catch (e) {
    console.error('Failed to load custom levels:', e);
    return [];
  }
};

// Save a new level or update existing
export const saveLevel = (level: CustomLevel): void => {
  const data = localStorage.getItem(STORAGE_KEY);
  let allLevels: CustomLevel[] = data ? JSON.parse(data) : [];
  
  const existingIndex = allLevels.findIndex(l => l.id === level.id);
  
  if (existingIndex >= 0) {
    // Update existing level
    allLevels[existingIndex] = {
      ...level,
      lastModified: new Date().toISOString()
    };
  } else {
    // Add new level
    allLevels.push({
      ...level,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allLevels));
  console.log('✅ Level saved:', level.name);
};

// Delete a level
export const deleteLevel = (levelId: string | number): void => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;
  
  try {
    let allLevels: CustomLevel[] = JSON.parse(data);
    allLevels = allLevels.filter(l => l.id !== levelId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLevels));
    console.log('🗑️ Level deleted:', levelId);
  } catch (e) {
    console.error('Failed to delete level:', e);
  }
};

// Get a specific level by ID
export const getLevel = (levelId: string | number): CustomLevel | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  try {
    const allLevels: CustomLevel[] = JSON.parse(data);
    return allLevels.find(l => l.id === levelId) || null;
  } catch (e) {
    console.error('Failed to load level:', e);
    return null;
  }
};

// Generate unique ID for new levels
export const generateLevelId = (username: string): string => {
  return `custom-${username}-${Date.now()}`;
};