<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Auth;
class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Auth::shouldUse('api');
        Broadcast::routes(['middleware' => ['auth:api']]);

        require base_path('routes/channels.php');
    }
}
