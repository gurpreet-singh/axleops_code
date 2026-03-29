package com.axleops.mobile.tracking.data

import android.content.Context
import app.cash.sqldelight.driver.android.AndroidSqliteDriver
import com.axleops.mobile.db.AxleOpsDatabase

/**
 * Android database driver factory.
 *
 * Uses [AndroidSqliteDriver] backed by the device's SQLite.
 * Data persists across process restarts.
 *
 * Source: plan §6 (platform DB driver factories)
 */
class DatabaseDriverFactory(
    private val context: Context,
) {
    fun create(): AxleOpsDatabase {
        val driver = AndroidSqliteDriver(
            schema = AxleOpsDatabase.Schema,
            context = context,
            name = "axleops_tracking.db",
        )
        return AxleOpsDatabase(driver)
    }
}
