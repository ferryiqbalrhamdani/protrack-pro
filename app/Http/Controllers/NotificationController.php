<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = $user->notifications();
        
        if ($request->filter === 'unread') {
            $query->whereNull('read_at');
        }

        $notifications = $query->paginate(20)->through(function($n) {
            return array_merge([
                'id' => $n->id,
                'unread' => $n->read_at === null,
                'time' => $n->created_at->diffForHumans()
            ], $n->data);
        });

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'activeFilter' => $request->filter ?? 'all',
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return back();
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return back();
    }

    public function destroy(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->delete();
        return back();
    }
}
