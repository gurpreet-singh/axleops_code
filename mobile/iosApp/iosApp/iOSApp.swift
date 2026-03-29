import SwiftUI
import Shared

/// T031: App delegate for handling location-triggered relaunch.
/// When iOS terminates the app and a significant location change occurs,
/// the system relaunches with UIApplication.LaunchOptionsKey.location.
/// Koin is already initialized in iOSApp.init(), so the tracking subsystem
/// can resume via ActiveTripComponent's init-time trip state check.
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        if let _ = launchOptions?[.location] {
            print("[AppDelegate] App relaunched via significant location change — tracking will resume")
            // No explicit action needed here:
            // 1. Koin is initialized in iOSApp.init()
            // 2. ActiveTripComponent checks trip state on init and calls TrackingManager.start()
            // 3. IOSLocationTracker re-registers with CLLocationManager
        }
        return true
    }
}

@main
struct iOSApp: App {

    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    init() {
        // Initialize Koin DI (FIX-002 / OI-03)
        KoinInitKt.doInitKoin()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}