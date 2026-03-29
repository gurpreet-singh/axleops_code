package com.axleops.mobile.tracking.data

import app.cash.sqldelight.driver.native.NativeSqliteDriver
import com.axleops.mobile.db.AxleOpsDatabase

/**
 * iOS database driver factory.
 *
 * Uses [NativeSqliteDriver] backed by the device's SQLite (via C interop).
 * Data persists across process restarts in the app's sandbox.
 *
 * Source: plan §6 (platform DB driver factories)
 */
class DatabaseDriverFactory {
    fun create(): AxleOpsDatabase {
        val driver = NativeSqliteDriver(
            schema = AxleOpsDatabase.Schema,
            name = "axleops_tracking.db",
        )
        return AxleOpsDatabase(driver)
    }
}
