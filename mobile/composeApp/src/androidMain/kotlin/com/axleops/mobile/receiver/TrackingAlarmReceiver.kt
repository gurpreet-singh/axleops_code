package com.axleops.mobile.receiver

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import com.axleops.mobile.service.LocationTrackingService

/**
 * BroadcastReceiver for OS kill recovery via AlarmManager.
 *
 * When tracking is active, an exact alarm is scheduled every 15 minutes.
 * If the tracking service is killed by the OS (Doze, memory pressure, OEM kills),
 * this alarm fires and restarts the service — IF an active transit trip still exists.
 *
 * ## Setup
 * - Alarm set when [LocationTrackingService] starts
 * - Alarm cancelled when tracking stops normally
 * - Uses `setExactAndAllowWhileIdle` to survive Doze mode
 *
 * Source: spec §6.5 (auto-restart after OS kill), plan §3
 */
class TrackingAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        println("[TrackingAlarmReceiver] Alarm triggered — checking if tracking should resume")

        // Restart the foreground service (it will check trip state internally)
        val tripNumber = intent?.getStringExtra(EXTRA_TRIP_NUMBER) ?: "Trip"
        LocationTrackingService.start(context, tripNumber)
    }

    companion object {
        private const val REQUEST_CODE = 9002
        private const val EXTRA_TRIP_NUMBER = "extra_trip_number"
        /** 15 minutes between safety checks. */
        private const val ALARM_INTERVAL_MS = 15L * 60 * 1000

        /**
         * Schedule a repeating exact alarm for tracking recovery.
         * Called when tracking starts.
         */
        fun schedule(context: Context, tripNumber: String) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, TrackingAlarmReceiver::class.java).apply {
                putExtra(EXTRA_TRIP_NUMBER, tripNumber)
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context, REQUEST_CODE, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + ALARM_INTERVAL_MS,
                pendingIntent,
            )
            println("[TrackingAlarmReceiver] Alarm scheduled (every ${ALARM_INTERVAL_MS / 60000} min)")
        }

        /**
         * Cancel the tracking recovery alarm.
         * Called when tracking stops normally.
         */
        fun cancel(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val intent = Intent(context, TrackingAlarmReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context, REQUEST_CODE, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            alarmManager.cancel(pendingIntent)
            println("[TrackingAlarmReceiver] Alarm cancelled")
        }
    }
}
