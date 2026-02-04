# Suggested Production Dependencies

To implement the "Offline-First" and "Doctor-in-the-Loop" features, add these to your `package.json`:

```json
{
  "dependencies": {
    "dexie": "^4.0.1",       // Local-first IndexedDB wrapper
    "dexie-react-hooks": "^1.1.7",
    "jwt-decode": "^4.0.0",  // Lightweight JWT handling
    "lucide-react": "^0.300.0", // Premium Icons
    "framer-motion": "^10.16.4", // Smooth micro-animations
    "next-pwa": "^5.6.0",    // One-click PWA setup
    "jose": "^5.2.0"         // Lightweight JWT/Edge compliant
  }
}
```

## Offline Sync Logic (Pillar 1)
```javascript
// db.js
import Dexie from 'dexie';

export const db = new Dexie('AnvikshaDB');
db.version(1).stores({
  scans: '++id, modality, timestamp, status, isVerified',
  pharmacy: '++id, query, results, timestamp'
});
```
