package com.github.rodis00.backend.usage;

/**
 * Utilities whose consumption is entered by hand each month. Electricity is missing on purpose:
 * it is a monthly expense and its consumption is stored with that expense.
 */
public enum UsageUtility {
    COLD_WATER,
    HOT_WATER,
    HEATING
}
