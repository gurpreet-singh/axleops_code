import SwiftUI
import Shared

/**
 * iOS root view — entry point for the AxleOps mobile app.
 *
 * Compose Multiplatform content is rendered via ComposeView
 * in a future integration step. For now, this shows a placeholder.
 */
struct ContentView: View {
    var body: some View {
        VStack {
            Text("AxleOps Mobile")
                .font(.title)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
