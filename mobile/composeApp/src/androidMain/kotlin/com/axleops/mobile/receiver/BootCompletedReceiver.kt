package com.axleops.mobile.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.axleops.mobile.service.LocationTrackingService

/**
 * BroadcastReceiver for BOOT_COMPLETED.
 *
 * After device reboot, checks if there's an active transit trip
 * and restarts the tracking foreground service if so.
 *
 * ## Requirement
 * `RECEIVE_BOOT_COMPLETED` permission must be declared in manifest (T021 ✅).
 *
 * Source: spec §9.1
 */
class BootCompletedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action != Intent.ACTION_BOOT_COMPLETED) return

        println("[BootCompletedReceiver] Device rebooted — checking for active tracking trip")

        // TODO: Check persisted trip state to determine if tracking should resume.
        // For now, this is a no-op until trip state persistence is implemented.
        // When ready:
        // 1. Read active trip status from SharedPreferences / DataStore
        // 2. If trip is in transit (DEPARTED/IN_TRANSIT/AT_CHECKPOINT), restart service
        // 3. LocationTrackingService.start(context, tripNumber)
    }
}
