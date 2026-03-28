package com.axleops.mobile.navigation

import com.arkivanov.decompose.ComponentContext
import com.arkivanov.decompose.router.pages.ChildPages
import com.arkivanov.decompose.router.pages.Pages
import com.arkivanov.decompose.router.pages.PagesNavigation
import com.arkivanov.decompose.router.pages.childPages
import com.arkivanov.decompose.router.pages.select
import com.arkivanov.decompose.value.Value
import com.arkivanov.decompose.value.operator.map

/**
 * Decompose component for the authenticated app shell.
 *
 * Manages the bottom tab bar via [ChildPages], where each page is a [TabComponent]
 * with its own independent [ChildStack]. Switching tabs preserves each tab's
 * navigation state — Decompose keeps all page components alive.
 *
 * Pure Kotlin — no Compose, no Android, no iOS imports.
 *
 * @param componentContext Decompose lifecycle and state restoration context.
 * @param tabs Ordered list of tab configurations from the role config.
 * @param landingTabIndex Index of the tab to show on initial entry (0-based).
 * @param screenFactory Factory passed down to each [TabComponent] for creating
 *   [ScreenChild] instances from [ScreenConfig].
 */
class ShellComponent(
    componentContext: ComponentContext,
    tabs: List<TabConfig>,
    landingTabIndex: Int = 0,
    private val screenFactory: (config: ScreenConfig, componentContext: ComponentContext) -> ScreenChild,
) : ComponentContext by componentContext {

    init {
        require(tabs.size in 2..5) {
            "Tab count must be 2–5, got ${tabs.size}"
        }
        require(landingTabIndex in tabs.indices) {
            "landingTabIndex $landingTabIndex out of range for ${tabs.size} tabs"
        }
    }

    private val pagesNavigation = PagesNavigation<TabConfig>()

    /**
     * The tab pages. Each page is a [TabComponent] with its own stack.
     * Compose rendering observes this to render the active tab's content
     * and the bottom navigation bar.
     */
    val tabPages: Value<ChildPages<TabConfig, TabComponent>> =
        childPages(
            source = pagesNavigation,
            serializer = TabConfig.serializer(),
            initialPages = {
                Pages(
                    items = tabs,
                    selectedIndex = landingTabIndex,
                )
            },
            childFactory = ::createTabComponent,
        )

    /**
     * Title of the active tab's current screen — drives the top bar text.
     *
     * Reactor chain: ShellComponent.activeTitle → active TabComponent.title
     *   → active ScreenConfig.title
     */
    val activeTitle: Value<String> = tabPages.map { pages ->
        val activeTab = pages.items[pages.selectedIndex].instance
        activeTab?.title?.value ?: ""
    }

    /**
     * Whether the active tab can navigate back (has screens above the landing).
     */
    val canGoBack: Boolean
        get() {
            val pages = tabPages.value
            val activeTab = pages.items[pages.selectedIndex].instance ?: return false
            return activeTab.canGoBack
        }

    // ── Public API ──────────────────────────────────────────────────────

    /**
     * Switch to the tab at the given index.
     * If already on this tab, resets it to its landing screen.
     */
    fun selectTab(index: Int) {
        val currentIndex = tabPages.value.selectedIndex
        if (index == currentIndex) {
            // Re-tap active tab → reset to root
            val activeTab = tabPages.value.items[currentIndex].instance
            activeTab?.resetToRoot()
        } else {
            pagesNavigation.select(index = index)
        }
    }

    /**
     * Handle system back press. Delegates to the active tab's pop.
     * Returns true if the back was consumed (i.e., popped within the tab).
     */
    fun onBackPressed(): Boolean {
        val pages = tabPages.value
        val activeTab = pages.items[pages.selectedIndex].instance ?: return false
        return if (activeTab.canGoBack) {
            activeTab.pop()
            true
        } else {
            false
        }
    }

    // ── Private ─────────────────────────────────────────────────────────

    private fun createTabComponent(
        config: TabConfig,
        componentContext: ComponentContext,
    ): TabComponent = TabComponent(
        componentContext = componentContext,
        tabId = config.id,
        tabLabel = config.label,
        screenFactory = screenFactory,
    )
}
