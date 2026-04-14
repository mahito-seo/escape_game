// Utility Functions
// ═══════════════════════════════════
//  SHA-256
// ═══════════════════════════════════
async function sha256(t){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");}
