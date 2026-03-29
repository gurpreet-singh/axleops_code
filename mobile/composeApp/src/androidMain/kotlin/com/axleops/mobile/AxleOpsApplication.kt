package com.axleops.mobile

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.axleops.mobile.di.analyticsModule
import com.axleops.mobile.di.appModule
import com.axleops.mobile.di.authModule
import com.axleops.mobile.di.dataSourceModule
import com.axleops.mobile.di.platformModule
import com.axleops.mobile.di.trackingModule
import com.axleops.mobile.di.tripModule
import com.axleops.mobile.di.uploadModule
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

/**
 * AxleOps Mobile Application class.
 *
 * Initializes Koin DI with all modules and creates notification channels.
 */
class AxleOpsApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        createNotificationChannels()

        startKoin {
            androidLogger(Level.DEBUG)
            androidContext(this@AxleOpsApplication)
            modules(
                appModule,
                analyticsModule,
                authModule,
                dataSourceModule,
                platformModule,
                trackingModule,
                tripModule,
                uploadModule,
            )
        }
    }

    /**
     * T022: Create notification channels.
     *
     * "Trip Tracking" channel for the persistent foreground service notification.
     * IMPORTANCE_LOW = no sound, shows in shade.
     */
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val trackingChannel = NotificationChannel(
                TRACKING_CHANNEL_ID,
                "Trip Tracking",
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = "Persistent notification during GPS location tracking"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(trackingChannel)
        }
    }

    companion object {
        const val TRACKING_CHANNEL_ID = "trip_tracking_channel"
    }
}
