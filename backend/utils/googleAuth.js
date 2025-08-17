import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Google credentials from Render secret file system (CORRECT FILE)
const credentialsPath = '/etc/secrets/client_secret_193682875788-2uu2dvss8f9m5h3mdtqt7kclpeqj73t0.apps.googleusercontent.com.json';
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
} catch (err) {
  console.error('❌ Could not read Google client secret file at', credentialsPath);
  throw err;
}

// Use both client_id and client_secret for completeness
const client = new OAuth2Client(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: credentials.web.client_id,
  });
  const payload = ticket.getPayload();
  return payload;
}

// Exchange auth code for tokens and verify ID token
async function getGoogleUserFromAuthCode(authCode) {
  try {
    console.log('🟡 Starting Google auth with code...');
    console.log('🟡 Client ID being used:', credentials.web.client_id);
    console.log('🟡 Auth code length:', authCode?.length || 'undefined');
    
    const { tokens } = await client.getToken(authCode);
    console.log('🟡 Received tokens:', Object.keys(tokens));
    
    if (!tokens.id_token) {
      console.error('❌ No ID token in Google response');
      throw new Error('No ID token in Google response');
    }
    
    console.log('🟡 Verifying ID token...');
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: credentials.web.client_id,
    });
    const payload = ticket.getPayload();
    console.log('✅ Google user payload:', { 
      email: payload.email, 
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name 
    });
    return { payload, tokens };
  } catch (error) {
    console.error('❌ Google auth error:', error.message);
    console.error('❌ Error details:', {
      name: error.name,
      stack: error.stack?.split('\n')[0]
    });
    console.error('❌ Client config:', {
      client_id: credentials.web.client_id,
      project_id: credentials.web.project_id
    });
    throw error;
  }
}

export { verifyGoogleToken, getGoogleUserFromAuthCode };
