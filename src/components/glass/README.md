# Glass Effect System

The glass effect system provides a unified, reusable approach to implementing glassmorphic UI elements throughout the Nafsy app. It consolidates various glass effects into a cohesive system with standardized variants, consistent theming, and platform optimization.

## Overview

The glass system consists of:
- **Glass effect hooks** for calculating glass properties
- **Glass container components** for different use cases  
- **Standardized variants** with predefined opacity and blur levels
- **Themed color palettes** that adapt to light/dark modes
- **Platform optimization** with iOS BlurView and Android fallbacks

## Components

### GlassContainer
Universal glass effect container with full customization options.

```tsx
import { GlassContainer } from '@/components/glass';

<GlassContainer
  variant="medium"
  borderRadius={20}
  padding={16}
  useBlur={true}
  useGradient={true}
  elevation={3}
>
  <Text>Content goes here</Text>
</GlassContainer>
```

### GlassCard
Pre-configured glass card for elevated content.

```tsx
import { GlassCard } from '@/components/glass';

<GlassCard elevation={4}>
  <Text>Card content</Text>
</GlassCard>
```

### GlassInput
Optimized glass container for input fields.

```tsx
import { GlassInput } from '@/components/glass';

<GlassInput borderRadius={25}>
  <TextInput placeholder="Type here..." />
</GlassInput>
```

### GlassOverlay
Lightweight overlay component for backgrounds and action indicators.

```tsx
import { GlassOverlay, GLASS_OVERLAY_COLORS } from '@/components/glass';

<GlassOverlay customColors={GLASS_OVERLAY_COLORS.FAVORITE}>
  <Icon name="heart" />
</GlassOverlay>
```

## Glass Variants

Predefined variants provide consistent glass effects across the app:

- **`light`**: Subtle transparency (0.1 opacity, 40 blur intensity)
- **`medium`**: Balanced visibility (0.3 opacity, 60 blur intensity) 
- **`heavy`**: Strong glass effect (0.5 opacity, 80 blur intensity)
- **`ultra`**: Maximum glass effect (0.7 opacity, 95 blur intensity)

**Specialized variants:**
- **`overlay`**: For background overlays (0.25 opacity, 50 blur intensity)
- **`card`**: For elevated cards (0.4 opacity, 70 blur intensity)
- **`input`**: For input containers (0.3 opacity, 80 blur intensity)
- **`modal`**: For modal backgrounds (0.8 opacity, 90 blur intensity)

## Hooks

### useGlassEffect
Core hook for calculating glass effect properties.

```tsx
import { useGlassEffect, GLASS_VARIANTS } from '@/hooks/glass';

const glassProps = useGlassEffect({
  variant: GLASS_VARIANTS.MEDIUM,
  elevation: 3,
  borderEnabled: true,
  shadowEnabled: true,
});
```

### useGlassStyle
Hook for generating glass styles for regular View components.

```tsx
import { useGlassStyle } from '@/hooks/glass';

const glassStyle = useGlassStyle({
  variant: 'light',
  borderEnabled: false,
});

<View style={[styles.container, glassStyle]}>
  <Text>Content</Text>
</View>
```

## Migration from Old Glass Effects

### Before (Manual Implementation)
```tsx
// Old manual glass effect
<BlurView intensity={80} tint="light" style={styles.blur}>
  <View style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
    <Text>Content</Text>
  </View>
</BlurView>

const styles = StyleSheet.create({
  blur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
```

### After (Glass System)
```tsx
// New glass system
<GlassContainer variant="medium" borderRadius={20}>
  <Text>Content</Text>
</GlassContainer>
```

## Overlay Colors

Predefined overlay colors for common UI patterns:

```tsx
import { GLASS_OVERLAY_COLORS } from '@/hooks/glass';

// Action overlays
GLASS_OVERLAY_COLORS.FAVORITE  // Pink heart action
GLASS_OVERLAY_COLORS.SUCCESS   // Green checkmark action  
GLASS_OVERLAY_COLORS.WARNING   // Yellow warning
GLASS_OVERLAY_COLORS.ERROR     // Red error
GLASS_OVERLAY_COLORS.INFO      // Blue information
```

## Theme Integration

The glass system automatically adapts to the app's theme:

**Light Theme:**
- Higher contrast glass effects
- Brighter overlay colors
- Light blur tint

**Dark Theme:**  
- Subtle glass effects
- Muted overlay colors
- Dark blur tint

## Platform Optimization

**iOS:**
- Uses native `BlurView` with `systemMaterial` tint
- Hardware-accelerated blur effects
- Smooth performance

**Android:**
- Fallback to gradient backgrounds
- Maintains visual consistency
- Optimized for various devices

## Best Practices

1. **Use semantic variants** instead of custom configurations when possible
2. **Leverage overlay colors** for consistent action indicators
3. **Consider elevation** for proper visual hierarchy
4. **Test on both platforms** to ensure consistent appearance
5. **Use GlassOverlay** for backgrounds, GlassCard for elevated content

## Performance Considerations

- Glass effects are optimized with `React.useMemo`
- Platform-specific implementations reduce overhead
- Standardized variants prevent recreation of similar effects
- Efficient blur intensity calculations

## Code Reduction Achieved

By implementing the glass system, we achieved:
- **~150+ lines** of code reduction across components
- **Consistent visual language** throughout the app
- **Better maintainability** with centralized glass logic
- **Platform optimization** for both iOS and Android
- **Theme-aware styling** that adapts automatically