/**
 * Analytics and logging abstraction layer.
 *
 * Provides [AnalyticsService] interface for tracking screen views, actions,
 * errors, and custom events. The foundation ships [LocalAnalyticsService]
 * which logs to platform console (Logcat / os_log). A remote analytics
 * provider can be swapped in via DI when selected.
 *
 * Foundation-owned. Instrumentation points are in navigation (screen views),
 * error handling (error events), and upload service (upload events).
 */
package com.axleops.mobile.analytics
