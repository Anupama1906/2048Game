// src/constants/theme.ts
export const TILE_COLORS: Record<number, string> = {
    // Positive (Orange/Yellow)
    2: 'bg-orange-100 text-gray-700 dark:bg-orange-200 dark:text-gray-900',
    4: 'bg-orange-200 text-gray-700 dark:bg-orange-300 dark:text-gray-900',
    8: 'bg-orange-300 text-white dark:bg-orange-500',
    16: 'bg-orange-400 text-white dark:bg-orange-600',
    32: 'bg-orange-500 text-white dark:bg-orange-700',
    64: 'bg-orange-600 text-white dark:bg-orange-800',
    128: 'bg-yellow-400 text-white dark:bg-yellow-600',
    256: 'bg-yellow-500 text-white dark:bg-yellow-700',
    512: 'bg-yellow-600 text-white dark:bg-yellow-800',
    1024: 'bg-yellow-700 text-white dark:bg-yellow-900',
    2048: 'bg-yellow-800 text-white dark:bg-yellow-950',

    // Negative (Blue Scale)
    [-2]: 'bg-blue-100 text-gray-700 dark:bg-blue-200 dark:text-gray-900',
    [-4]: 'bg-blue-200 text-gray-700 dark:bg-blue-300 dark:text-gray-900',
    [-8]: 'bg-blue-300 text-white dark:bg-blue-500',
    [-16]: 'bg-blue-400 text-white dark:bg-blue-600',
    [-32]: 'bg-blue-500 text-white dark:bg-blue-700',
    [-64]: 'bg-blue-600 text-white dark:bg-blue-800',
    [-128]: 'bg-indigo-400 text-white dark:bg-indigo-600',
    [-256]: 'bg-indigo-500 text-white dark:bg-indigo-700',
    [-512]: 'bg-indigo-600 text-white dark:bg-indigo-800',
    [-1024]: 'bg-indigo-700 text-white dark:bg-indigo-900',
    [-2048]: 'bg-indigo-800 text-white dark:bg-indigo-950',
};