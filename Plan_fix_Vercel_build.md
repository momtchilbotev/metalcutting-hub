# Fix Vercel Build Error - Wrong Import Path in messages.js

## Context
The Vercel build is failing with the error:
```
Could not resolve "../../../scripts/services/auth.js" from "src/pages/messages/messages.js"
```

The `messages.js` file uses incorrect relative import paths (3 levels up instead of 2).

## Root Cause
- Vite config has `root: 'src'`, so paths resolve relative to `src/`
- `src/pages/messages/messages.js` is at depth 2 from `src/`
- The file incorrectly uses `../../../scripts/` (3 levels) instead of `../../scripts/` (2 levels)

Path breakdown:
- `src/pages/messages/messages.js` → `../../` → `src/` ✓
- `src/pages/messages/messages.js` → `../../../` → project root ✗

## Fix
Update all import paths in `src/pages/messages/messages.js` from `../../../scripts/` to `../../scripts/`.

**File:** `src/pages/messages/messages.js`

Lines to change:
1. Line 2: `import { authService } from '../../../scripts/services/auth.js';`
   → `import { authService } from '../../scripts/services/auth.js';`

2. Line 3: `import { Toast } from '../../../scripts/components/Toast.js';`
   → `import { Toast } from '../../scripts/components/Toast.js';`

3. Line 4: `import { formatDate } from '../../../scripts/utils/formatters.js';`
   → `import { formatDate } from '../../scripts/utils/formatters.js';`

4. Line 5: `import { supabase } from '../../../scripts/utils/supabaseClient.js';`
   → `import { supabase } from '../../scripts/utils/supabaseClient.js';`

## Verification
1. Run `npm run build` locally - should complete without errors
2. Commit and push to trigger Vercel rebuild
3. Verify Vercel deployment succeeds
