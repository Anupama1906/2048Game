// src/utils/testMigration.ts
// Run this in browser console to test the new daily puzzle system

import { 
  publishDailyPuzzle, 
  fetchDailyPuzzle, 
  getAllScheduledPuzzles,
  deleteDailyPuzzle,
  cleanupOldPuzzles,
  getDateKey 
} from '../services/dailyPuzzleService';
import type { Level } from '../types/types';

// Test level for migration
const createTestLevel = (index: number): Level => ({
  id: `test-${index}`,
  target: 64,
  name: `Test Puzzle ${index}`,
  description: `This is test puzzle number ${index}`,
  par: 10,
  grid: [
    [2, 2, 0, 0],
    [4, 4, 0, 0],
    [8, 8, 0, 0],
    [16, 16, 0, 0]
  ],
  section: 'Daily'
});

export const testMigration = {
  
  // 1. Publish a test puzzle for today
  publishToday: async () => {
    console.log('📤 Publishing test puzzle for today...');
    const today = getDateKey();
    const testLevel = createTestLevel(1);
    
    try {
      await publishDailyPuzzle(testLevel, today);
      console.log('✅ Success! Puzzle published for:', today);
      return true;
    } catch (error) {
      console.error('❌ Failed:', error);
      return false;
    }
  },
  
  // 2. Fetch today's puzzle
  fetchToday: async () => {
    console.log('📥 Fetching today\'s puzzle...');
    const today = getDateKey();
    
    try {
      const puzzle = await fetchDailyPuzzle(today);
      if (puzzle) {
        console.log('✅ Found puzzle:', puzzle);
        return puzzle;
      } else {
        console.warn('⚠️ No puzzle found for today');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed:', error);
      return null;
    }
  },
  
  // 3. Publish puzzles for next 7 days
  publishWeek: async () => {
    console.log('📤 Publishing puzzles for next 7 days...');
    const results = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateKey = getDateKey(date);
      const testLevel = createTestLevel(i + 1);
      
      try {
        await publishDailyPuzzle(testLevel, dateKey);
        console.log(`✅ Day ${i + 1}: ${dateKey}`);
        results.push({ date: dateKey, success: true });
      } catch (error) {
        console.error(`❌ Day ${i + 1} failed:`, error);
        results.push({ date: dateKey, success: false, error });
      }
    }
    
    console.log('📊 Results:', results);
    return results;
  },
  
  // 4. List all scheduled puzzles
  listAll: async () => {
    console.log('📋 Fetching all scheduled puzzles...');
    
    try {
      const puzzles = await getAllScheduledPuzzles();
      console.log(`✅ Found ${puzzles.length} puzzles:`);
      console.table(puzzles);
      return puzzles;
    } catch (error) {
      console.error('❌ Failed:', error);
      return [];
    }
  },
  
  // 5. Delete today's puzzle
  deleteToday: async () => {
    console.log('🗑️ Deleting today\'s puzzle...');
    const today = getDateKey();
    
    const confirm = window.confirm(`Delete puzzle for ${today}?`);
    if (!confirm) {
      console.log('❌ Cancelled');
      return false;
    }
    
    try {
      await deleteDailyPuzzle(today);
      console.log('✅ Deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed:', error);
      return false;
    }
  },
  
  // 6. Test cleanup (deletes old puzzles)
  testCleanup: async () => {
    console.log('🧹 Testing cleanup of old puzzles...');
    
    try {
      await cleanupOldPuzzles();
      console.log('✅ Cleanup completed');
      return true;
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      return false;
    }
  },
  
  // 7. Create old puzzle for cleanup testing
  createOldPuzzle: async () => {
    console.log('📤 Creating old puzzle (12 days ago) for cleanup testing...');
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 12);
    const dateKey = getDateKey(oldDate);
    const testLevel = createTestLevel(99);
    
    try {
      await publishDailyPuzzle(testLevel, dateKey);
      console.log(`✅ Created old puzzle: ${dateKey}`);
      console.log('💡 Now run testCleanup() to verify it gets deleted');
      return dateKey;
    } catch (error) {
      console.error('❌ Failed:', error);
      return null;
    }
  },
  
  // 8. Full test suite
  runAll: async () => {
    console.log('🧪 Running full test suite...\n');
    
    const results = {
      publishToday: false,
      fetchToday: false,
      publishWeek: false,
      listAll: false,
      cleanup: false
    };
    
    // Test 1: Publish today
    console.log('\n--- Test 1: Publish Today ---');
    results.publishToday = await testMigration.publishToday();
    
    // Test 2: Fetch today
    console.log('\n--- Test 2: Fetch Today ---');
    const puzzle = await testMigration.fetchToday();
    results.fetchToday = puzzle !== null;
    
    // Test 3: Publish week
    console.log('\n--- Test 3: Publish Week ---');
    const weekResults = await testMigration.publishWeek();
    results.publishWeek = weekResults.every(r => r.success);
    
    // Test 4: List all
    console.log('\n--- Test 4: List All ---');
    const puzzles = await testMigration.listAll();
    results.listAll = puzzles.length > 0;
    
    // Test 5: Cleanup
    console.log('\n--- Test 5: Cleanup ---');
    results.cleanup = await testMigration.testCleanup();
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.table(results);
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    if (passed === total) {
      console.log(`🎉 All ${total} tests passed!`);
    } else {
      console.warn(`⚠️ ${passed}/${total} tests passed`);
    }
    
    return results;
  },
  
  // Helper: Get date key for relative days
  getDateFor: (daysFromToday: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return getDateKey(date);
  }
};

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).testMigration = testMigration;
  console.log('✅ Test migration utilities loaded!');
  console.log('📖 Usage:');
  console.log('  testMigration.publishToday()    - Publish test puzzle for today');
  console.log('  testMigration.fetchToday()      - Fetch today\'s puzzle');
  console.log('  testMigration.publishWeek()     - Publish 7 days of puzzles');
  console.log('  testMigration.listAll()         - List all scheduled puzzles');
  console.log('  testMigration.deleteToday()     - Delete today\'s puzzle');
  console.log('  testMigration.testCleanup()     - Test auto-cleanup');
  console.log('  testMigration.createOldPuzzle() - Create old puzzle for testing');
  console.log('  testMigration.runAll()          - Run all tests');
}

export default testMigration;