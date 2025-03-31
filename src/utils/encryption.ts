const ENCRYPTION_VERSION = 'v1';
const ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ITERATIONS = 250000;

export async function encryptData(data: string, password: string): Promise<string> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyMaterial = await getKeyMaterial(password);
    const key = await deriveKey(keyMaterial, salt);
    const encrypted = await encrypt(key, iv, data);

    const combined = new Uint8Array(salt.length + iv.length + encrypted.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encrypted, salt.length + iv.length);

    return `${ENCRYPTION_VERSION}:${bufferToBase64(combined)}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

export async function decryptData(encryptedData: string, password: string): Promise<string> {
  try {
    const [version, data] = encryptedData.split(':');
    if (version !== ENCRYPTION_VERSION) {
      throw new Error('Unsupported encryption version');
    }

    const combined = base64ToBuffer(data);
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const keyMaterial = await getKeyMaterial(password);
    const key = await deriveKey(keyMaterial, salt);
    return await decrypt(key, iv, encrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
}

async function deriveKey(keyMaterial: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: KEY_DERIVATION_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(key: CryptoKey, iv: Uint8Array, data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  return new Uint8Array(
    await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoder.encode(data)
    )
  );
}

async function decrypt(key: CryptoKey, iv: Uint8Array, data: Uint8Array): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}

function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

function base64ToBuffer(base64: string): Uint8Array {
  return new Uint8Array([...atob(base64)].map(c => c.charCodeAt(0)));
}
