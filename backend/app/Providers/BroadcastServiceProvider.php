<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Auth;

/**
 * Proveïdor de serveis de broadcasting (WebSocket).
 *
 * Configura les rutes d'autenticació de canals i carrega les definicions
 * de canals des de routes/channels.php.
 *
 * Sense aquest proveïdor, Laravel Echo no podria autenticar-se
 * als canals privats del xat i les batalles.
 */
class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Forcem que l'autenticació de broadcasting utilitzi el guard 'api' (token JWT)
        // en comptes del guard 'web' per defecte (sessions)
        Auth::shouldUse('api');

        // Registrem la ruta /broadcasting/auth que Laravel Echo utilitza per autenticar-se
        // als canals privats. Només usuaris amb un token vàlid poden accedir-hi.
        Broadcast::routes(['middleware' => ['auth:api']]);

        // Carreguem les definicions de canals (channels.php) on es defineix
        // qui pot escoltar cada canal privat (xat, batalles, etc.)
        require base_path('routes/channels.php');
    }
}
