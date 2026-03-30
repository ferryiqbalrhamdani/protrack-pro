import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;
const reverbKey = window.REVERB_CONFIG?.key || import.meta.env.VITE_REVERB_APP_KEY;
// Fallback to current domain if not on localhost
const reverbHost = window.location.hostname === 'localhost' ? (import.meta.env.VITE_REVERB_HOST || 'localhost') : window.location.hostname;
const reverbPort = window.location.hostname === 'localhost' ? (import.meta.env.VITE_REVERB_PORT || 8002) : 443;
const reverbScheme = window.location.hostname === 'localhost' ? (import.meta.env.VITE_REVERB_SCHEME || 'http') : 'https';
if (reverbKey) {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: reverbHost,
        wsPort: reverbPort,
        wssPort: reverbPort,
        forceTLS: reverbScheme === 'https',
        enabledTransports: ['ws', 'wss'],
    });
} else {
    console.warn('Reverb configuration missing. Real-time features may not work.');
}
