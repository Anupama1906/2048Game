// src/utils/daily.ts
import type { Level } from "../types/types";
import { DAILY_LEVELS } from "../data/dailyLevels";

export const getDailyLevel = (): Level => {
    // 1. Get today's date string (local time) to seed the selection
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    // 2. Create a simple hash from the date string
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    // 3. Select level using positive modulo
    const index = Math.abs(hash) % DAILY_LEVELS.length;
    const baseLevel = DAILY_LEVELS[index];

    // 4. Return the level with a specific "Daily" ID so we can track its score separately if needed
    return {
        ...baseLevel,
        id: `daily-${dateString}`, // Unique ID per day (e.g. daily-2023-10-27)
        section: "Daily",
        name: `Daily: ${baseLevel.name}`
    };
};