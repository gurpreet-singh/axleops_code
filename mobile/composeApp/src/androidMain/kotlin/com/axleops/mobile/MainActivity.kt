package com.axleops.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.arkivanov.decompose.defaultComponentContext

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        // Create Decompose ComponentContext at the Activity level.
        // This provides lifecycle, state saving, and back button handling
        // to the entire Decompose component tree.
        val componentContext = defaultComponentContext()

        setContent {
            App(componentContext = componentContext)
        }
    }
}
