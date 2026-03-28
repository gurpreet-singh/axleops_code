import SwiftUI
import Shared

@main
struct iOSApp: App {

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