package com.axleops.mobile.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.axleops.mobile.AxleOpsApplication.Companion.TRACKING_CHANNEL_ID
import com.axleops.mobile.MainActivity

/**
 * Android Foreground Service for GPS location tracking background survival.
 *
 * ## Purpose
 * Keeps the app alive and receiving GPS updates when the app is in the background,
 * screen is off, or Doze mode is active. Without this service, Android will
 * aggressively kill the app and stop location updates.
 *
 * ## Architecture
 * - Started by the UI layer when tracking begins
 * - Shows a persistent notification ("Trip #X — Location tracking active")
 * - Holds a PARTIAL_WAKE_LOCK to survive CPU sleep
 * - Stopped by the UI layer when tracking ends (or auto-stopped by safety net)
 *
 * ## Note
 * This service does NOT directly manage GPS — that's handled by [AndroidLocationTracker]
 * via the Koin singleton. This service purely prevents the process from being killed.
 *
 * Source: spec §9.1, plan §3
 */
class LocationTrackingService : Service() {

    private var wakeLock: PowerManager.WakeLock? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action

        // FX-015: Handle notification text updates
        if (action == ACTION_UPDATE_NOTIFICATION) {
            val text = intent.getStringExtra(EXTRA_NOTIFICATION_TEXT) ?: return START_STICKY
            updateNotification(text)
            return START_STICKY
        }

        val tripNumber = intent?.getStringExtra(EXTRA_TRIP_NUMBER) ?: "Trip"

        // Create persistent notification
        val notification = buildNotification(tripNumber)
        startForeground(NOTIFICATION_ID, notification)

        // Acquire partial wake lock — prevents CPU sleep
        acquireWakeLock()

        println("[LocationTrackingService] Started for $tripNumber")
        return START_STICKY // Restart if killed by OS
    }

    override fun onDestroy() {
        releaseWakeLock()
        println("[LocationTrackingService] Destroyed")
        super.onDestroy()
    }

    /**
     * Build the persistent tracking notification.
     *
     * Shows trip number + "Location tracking active".
     * Sets ongoing=true so it cannot be swiped away.
     * Taps open the main app.
     */
    private fun buildNotification(tripNumber: String): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        return NotificationCompat.Builder(this, TRACKING_CHANNEL_ID)
            .setContentTitle(tripNumber)
            .setContentText("Location tracking active")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .build()
    }

    /**
     * Update the notification (e.g., when tracking state changes).
     */
    fun updateNotification(text: String) {
        val notification = NotificationCompat.Builder(this, TRACKING_CHANNEL_ID)
            .setContentTitle("Trip Tracking")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .build()

        val manager = getSystemService(android.app.NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, notification)
    }

    @Suppress("DEPRECATION")
    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "AxleOps::LocationTracking",
        ).apply {
            acquire(48L * 60 * 60 * 1000) // 48h max per safety net
        }
    }

    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) it.release()
        }
        wakeLock = null
    }

    companion object {
        const val NOTIFICATION_ID = 9001
        const val EXTRA_TRIP_NUMBER = "extra_trip_number"
        const val ACTION_UPDATE_NOTIFICATION = "com.axleops.mobile.UPDATE_TRACKING_NOTIFICATION"
        const val EXTRA_NOTIFICATION_TEXT = "extra_notification_text"

        /**
         * Start the foreground tracking service.
         */
        fun start(context: Context, tripNumber: String) {
            val intent = Intent(context, LocationTrackingService::class.java).apply {
                putExtra(EXTRA_TRIP_NUMBER, tripNumber)
            }
            context.startForegroundService(intent)
        }

        /**
         * Stop the foreground tracking service.
         */
        fun stop(context: Context) {
            val intent = Intent(context, LocationTrackingService::class.java)
            context.stopService(intent)
        }

        /**
         * FX-015: Update the foreground notification text.
         * Called when tracking state changes (e.g., ACTIVE → SIGNAL_LOST).
         */
        fun updateNotificationText(context: Context, text: String) {
            val intent = Intent(context, LocationTrackingService::class.java).apply {
                action = ACTION_UPDATE_NOTIFICATION
                putExtra(EXTRA_NOTIFICATION_TEXT, text)
            }
            context.startService(intent)
        }
    }
}
