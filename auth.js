// Change this: open hash.html, type your new password, paste the result here.
const PASSWORD_HASH="f997a9dce42222b67db1f31a5bb1afa35298a97ccfefffffde7f96c748f4c4c1";
const DEV_USER="admin";
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
