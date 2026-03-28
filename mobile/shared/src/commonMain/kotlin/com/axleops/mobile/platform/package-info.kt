/**
 * Platform abstraction layer using expect/actual pattern.
 *
 * This package defines common interfaces for platform-specific capabilities
 * (secure storage, connectivity, camera, gallery, permissions). Each expect
 * declaration has corresponding actual implementations in androidMain and iosMain.
 *
 * Foundation-owned. Feature epics consume these via DI — they do not
 * create their own platform abstractions.
 */
package com.axleops.mobile.platform
