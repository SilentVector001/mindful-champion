# Safari/iOS React Error #300 - Root Cause Analysis

## Error Details
- **Error Code**: Minified React error #300
- **Full Message**: "Rendered fewer hooks than expected. This may be caused by an accidental early return statement"
- **Platform**: Safari on iPad (iOS), does NOT occur on Chrome
- **Component**: Coach Kai (PTT AI Coach with TTS)

## Root Cause
React error #300 occurs when hooks are called inconsistently between renders. This can happen due to:

1. **Early returns before hooks** - A conditional return that executes before all hooks are called
2. **Conditional hook calls** - Hooks inside if statements or loops  
3. **SSR/Hydration mismatches** - Server renders differently than client (Safari-specific)
4. **Browser API availability** - Safari may report speechSynthesis differently during hydration

## Specific Issue in Our Code
In `text-to-speech.tsx`, there are 10+ hooks (`useState`, `useEffect`, `useRef`, `useCallback`) declared at the top. However:

- Safari may have timing issues with `speechSynthesis` API detection
- The `isSupported` check happens during render but hooks are already declared
- Safari's stricter hydration can cause hooks to be skipped on first render

## The Fix
Ensure ALL hooks are called UNCONDITIONALLY at the component's top level, before any conditional logic or early returns.
