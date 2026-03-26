<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        // Fetch browser sessions from the sessions table
        $sessions = $this->getSessions($request);

        return Inertia::render('Profile/Edit', [
            'sessions' => $sessions,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information (name, username, photo).
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username,' . $request->user()->id],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email,' . $request->user()->id],
            'profile_photo' => ['nullable', 'image', 'max:2048'], // 2MB max
        ]);

        $user = $request->user();
        $user->name = $validated['name'];
        $user->username = $validated['username'];
        $user->email = $validated['email'] ?? $user->email;

        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $user->profile_photo = $path;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return Redirect::route('profile.edit')->with('status', 'password-updated');
    }

    /**
     * Destroy a specific browser session.
     */
    public function destroySession(Request $request, string $sessionId): RedirectResponse
    {
        // Validate password before allowing session destruction
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        // Don't allow destroying your own current session
        if ($sessionId === $request->session()->getId()) {
            return back()->withErrors(['session' => 'Anda tidak dapat menghapus sesi saat ini.']);
        }

        DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', $request->user()->id)
            ->delete();

        return Redirect::route('profile.edit')->with('status', 'session-destroyed');
    }

    /**
     * Get all browser sessions for the authenticated user.
     */
    private function getSessions(Request $request): array
    {
        $sessions = DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->orderBy('last_activity', 'desc')
            ->get();

        $currentSessionId = $request->session()->getId();

        return $sessions->map(function ($session) use ($currentSessionId) {
            $agent = $this->parseUserAgent($session->user_agent ?? '');

            return [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'browser' => $agent['browser'],
                'os' => $agent['os'],
                'device_type' => $agent['device_type'],
                'is_current_device' => $session->id === $currentSessionId,
                'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
            ];
        })->toArray();
    }

    /**
     * Parse user agent string into readable browser, OS, and device type.
     */
    private function parseUserAgent(string $userAgent): array
    {
        // Detect browser
        $browser = 'Unknown';
        if (str_contains($userAgent, 'Edg/')) $browser = 'Microsoft Edge';
        elseif (str_contains($userAgent, 'OPR/') || str_contains($userAgent, 'Opera')) $browser = 'Opera';
        elseif (str_contains($userAgent, 'Chrome/') && !str_contains($userAgent, 'Edg/')) $browser = 'Google Chrome';
        elseif (str_contains($userAgent, 'Firefox/')) $browser = 'Mozilla Firefox';
        elseif (str_contains($userAgent, 'Safari/') && !str_contains($userAgent, 'Chrome/')) $browser = 'Safari';

        // Detect OS
        $os = 'Unknown';
        if (str_contains($userAgent, 'Windows NT 10')) $os = 'Windows 10/11';
        elseif (str_contains($userAgent, 'Windows')) $os = 'Windows';
        elseif (str_contains($userAgent, 'Mac OS X')) $os = 'macOS';
        elseif (str_contains($userAgent, 'Linux') && str_contains($userAgent, 'Android')) $os = 'Android';
        elseif (str_contains($userAgent, 'Linux')) $os = 'Linux';
        elseif (str_contains($userAgent, 'iPhone') || str_contains($userAgent, 'iPad')) $os = 'iOS';

        // Detect device type
        $deviceType = 'desktop';
        if (str_contains($userAgent, 'Mobile') || str_contains($userAgent, 'Android') || str_contains($userAgent, 'iPhone')) {
            $deviceType = 'mobile';
        } elseif (str_contains($userAgent, 'iPad') || str_contains($userAgent, 'Tablet')) {
            $deviceType = 'tablet';
        }

        return ['browser' => $browser, 'os' => $os, 'device_type' => $deviceType];
    }
}
