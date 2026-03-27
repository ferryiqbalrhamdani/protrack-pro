import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const reverbKey = window.REVERB_CONFIG?.key || import.meta.env.VITE_REVERB_APP_KEY;
const reverbHost = window.REVERB_CONFIG?.host || import.meta.env.VITE_REVERB_HOST;
const reverbPort = window.REVERB_CONFIG?.port || import.meta.env.VITE_REVERB_PORT;
const reverbScheme = window.REVERB_CONFIG?.scheme || import.meta.env.VITE_REVERB_SCHEME;

if (reverbKey) {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: reverbHost || 'localhost',
        wsPort: reverbPort ?? 8080,
        wssPort: reverbPort ?? 443,
        forceTLS: (reverbScheme ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
} else {
    console.warn('Reverb configuration missing. Real-time features may not work.');
}
