#!/bin/bash

##############################################################################
# CC-56 — Apply Numo Hardening Phase 1 (Event Mode Manager + Mint Gate)
# CORRECTED VERSION for io.refueler.merchant package structure
#
# This script automates the creation of EventModeManager.kt and patching of
# MintManager.kt. It does NOT run gradle — only creates files.
#
# Usage:
#   chmod +x apply-numo-phase1-CORRECTED.sh
#   ./apply-numo-phase1-CORRECTED.sh /path/to/numo-fork
#
# Then run:
#   cd /path/to/numo-fork
#   ./gradlew build
#
##############################################################################

set -e  # Exit on first error

NUMO_ROOT="${1:-.}"

if [ ! -d "$NUMO_ROOT/app" ]; then
    echo "ERROR: Numo app directory not found at $NUMO_ROOT/app"
    echo "Usage: $0 /path/to/numo-fork"
    exit 1
fi

# Corrected paths for io.refueler.merchant package structure
KOTLIN_SRC="$NUMO_ROOT/app/src/main/java/io/refueler/merchant/core/cashu"
UTIL_SRC="$NUMO_ROOT/app/src/main/java/io/refueler/merchant/core/util"

echo "=========================================="
echo "CC-56 Phase 1: Event Mode Manager Setup"
echo "=========================================="
echo ""
echo "Package: io.refueler.merchant"
echo "Target: $KOTLIN_SRC"
echo ""

# Step 1: Create EventModeManager.kt
echo "[1/4] Creating EventModeManager.kt..."

mkdir -p "$KOTLIN_SRC"

cat > "$KOTLIN_SRC/EventModeManager.kt" << 'EOF'
package io.refueler.merchant.core.cashu

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Manages event/pop-up mode configuration for Numo terminal.
 * 
 * Event mode disables privacy-risk operations proportionate only to
 * franchise-grade deployments (e.g., public relay broadcasts).
 * 
 * In event mode:
 * - Mint backup broadcasts are disabled (metadata leak not justified for one-night pop-up)
 * - Webhook delivery is unchanged (still required for payment settlement)
 * - Credential storage still uses encryption (device theft protection)
 * 
 * Initialized from environment (NUMO_EVENT_MODE=true) or admin panel.
 * Once set, persists for the session.
 */
class EventModeManager(private val context: Context) {
    
    private val prefs: SharedPreferences = getOrCreateEncryptedPrefs()
    
    companion object {
        private const val PREFS_NAME = "event_mode_config"
        private const val KEY_EVENT_MODE = "is_event_mode"
        private const val ENV_EVENT_MODE = "NUMO_EVENT_MODE"
    }
    
    init {
        // Check environment on first app start; persist to SharedPreferences
        val envEventMode = System.getenv(ENV_EVENT_MODE)?.toBoolean() ?: false
        if (!prefs.contains(KEY_EVENT_MODE)) {
            prefs.edit().putBoolean(KEY_EVENT_MODE, envEventMode).apply()
        }
    }
    
    fun isEventMode(): Boolean = prefs.getBoolean(KEY_EVENT_MODE, false)
    
    fun setEventMode(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_EVENT_MODE, enabled).apply()
    }
    
    private fun getOrCreateEncryptedPrefs(): SharedPreferences {
        return try {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            
            EncryptedSharedPreferences.create(
                context,
                PREFS_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            // Fallback: if Keystore unavailable, use regular SharedPreferences
            // (Not ideal, but ensures app doesn't crash on first boot)
            android.util.Log.w("EventModeManager", "EncryptedSharedPreferences failed, falling back to plain SharedPreferences", e)
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        }
    }
}
EOF

echo "   ✓ Created $KOTLIN_SRC/EventModeManager.kt"
echo ""

# Step 2: Patch MintManager.kt
echo "[2/4] Patching MintManager.kt..."

MINT_MGR="$UTIL_SRC/MintManager.kt"

if [ ! -f "$MINT_MGR" ]; then
    echo "   ✗ ERROR: MintManager.kt not found at $MINT_MGR"
    echo "   Check your directory structure and try again."
    exit 1
fi

# Check if EventModeManager is already imported
if grep -q "import io.refueler.merchant.core.cashu.EventModeManager" "$MINT_MGR"; then
    echo "   (EventModeManager import already present)"
else
    # Add import at the end of other imports (before first non-import line)
    sed -i.bak '/^import io.refueler.merchant/a\
import io.refueler.merchant.core.cashu.EventModeManager
' "$MINT_MGR"
    echo "   ✓ Added EventModeManager import"
fi

# Add eventModeManager property to MintManager class (after private constructor(context: Context))
if grep -q "private val eventModeManager: EventModeManager" "$MINT_MGR"; then
    echo "   (eventModeManager property already present)"
else
    # Find the line "private constructor(context: Context)" and add eventModeManager initialization after it
    sed -i.bak '/private constructor(context: Context)/a\
    private val eventModeManager = EventModeManager(context)
' "$MINT_MGR"
    echo "   ✓ Added eventModeManager initialization to MintManager"
fi

# Now patch triggerNostrMintBackup to gate the call
if grep -q "if (eventModeManager.isEventMode())" "$MINT_MGR"; then
    echo "   (Event mode gate already present in triggerNostrMintBackup)"
else
    # Find "private fun triggerNostrMintBackup()" and inject the gate after the opening brace
    awk '/private fun triggerNostrMintBackup\(\)/{
        print $0
        getline  # read the next line (opening brace and/or first statement)
        if ($0 ~ /\{/) {
            print $0
            print "        if (eventModeManager.isEventMode()) {"
            print "            return"
            print "        }"
        } else {
            # If opening brace is on same line, handle differently
            print "        if (eventModeManager.isEventMode()) {"
            print "            return"
            print "        }"
            print $0
        }
        next
    }1' "$MINT_MGR" > "$MINT_MGR.tmp" && mv "$MINT_MGR.tmp" "$MINT_MGR"
    echo "   ✓ Injected event mode gate in triggerNostrMintBackup"
fi

echo ""

# Step 3: Verify MintManager patches
echo "[3/4] Verifying patches..."

IMPORTS_OK=$(grep -c "import io.refueler.merchant.core.cashu.EventModeManager" "$MINT_MGR" || echo "0")
INIT_OK=$(grep -c "private val eventModeManager = EventModeManager" "$MINT_MGR" || echo "0")
GATE_OK=$(grep -c "if (eventModeManager.isEventMode())" "$MINT_MGR" || echo "0")

if [ "$IMPORTS_OK" -gt 0 ] && [ "$INIT_OK" -gt 0 ] && [ "$GATE_OK" -gt 0 ]; then
    echo "   ✓ EventModeManager imported"
    echo "   ✓ EventModeManager initialized in MintManager"
    echo "   ✓ Event mode gate present in triggerNostrMintBackup"
else
    echo "   ⚠ WARNING: Some patches may not have applied correctly"
    echo "   IMPORTS: $IMPORTS_OK (expected 1+)"
    echo "   INIT: $INIT_OK (expected 1+)"
    echo "   GATE: $GATE_OK (expected 1+)"
    echo "   Manual inspection recommended:"
    echo "   - grep 'EventModeManager' $MINT_MGR"
    echo "   - grep 'isEventMode()' $MINT_MGR"
fi

echo ""

# Step 4: Update build.gradle to add security-crypto dependency
echo "[4/4] Adding androidx.security:security-crypto dependency..."

BUILD_GRADLE="$NUMO_ROOT/app/build.gradle"
BUILD_GRADLE_KTS="$NUMO_ROOT/app/build.gradle.kts"

if [ -f "$BUILD_GRADLE" ]; then
    if grep -q "androidx.security:security-crypto" "$BUILD_GRADLE"; then
        echo "   (Dependency already present)"
    else
        # Find dependencies block and add the new dependency
        if grep -q "dependencies {" "$BUILD_GRADLE"; then
            sed -i.bak '/dependencies {/a\
    implementation "androidx.security:security-crypto:1.1.0-alpha06"
' "$BUILD_GRADLE"
            echo "   ✓ Added to $BUILD_GRADLE"
        else
            echo "   ⚠ Could not find dependencies block in $BUILD_GRADLE"
            echo "   Manual addition required. Add this line to dependencies:"
            echo "   implementation \"androidx.security:security-crypto:1.1.0-alpha06\""
        fi
    fi
elif [ -f "$BUILD_GRADLE_KTS" ]; then
    if grep -q "androidx.security:security-crypto" "$BUILD_GRADLE_KTS"; then
        echo "   (Dependency already present)"
    else
        if grep -q "dependencies {" "$BUILD_GRADLE_KTS"; then
            sed -i.bak '/dependencies {/a\
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
' "$BUILD_GRADLE_KTS"
            echo "   ✓ Added to $BUILD_GRADLE_KTS"
        else
            echo "   ⚠ Could not find dependencies block in $BUILD_GRADLE_KTS"
            echo "   Manual addition required. Add this line to dependencies:"
            echo "   implementation(\"androidx.security:security-crypto:1.1.0-alpha06\")"
        fi
    fi
else
    echo "   ✗ ERROR: No build.gradle or build.gradle.kts found"
    exit 1
fi

echo ""
echo "=========================================="
echo "Phase 1 Setup Complete ✓"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. cd $NUMO_ROOT"
echo "  2. ./gradlew clean"
echo "  3. ./gradlew build"
echo ""
echo "Watch for these in the build output:"
echo "  - gradle sync completes without errors"
echo "  - No unresolved imports for androidx.security.*"
echo "  - BUILD SUCCESSFUL"
echo ""
echo "Files modified/created:"
echo "  + $KOTLIN_SRC/EventModeManager.kt"
echo "  ~ $MINT_MGR (imports, initialization, gate injected)"
echo "  ~ $BUILD_GRADLE (or .kts) (security-crypto dependency added)"
echo ""
