<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Routing\Router;
use App\Http\Middleware\JwtMiddleware;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registrar alias de middleware para usar 'JwtMiddleware' en rutas
        $router = $this->app->make(Router::class);
        $router->aliasMiddleware('JwtMiddleware', JwtMiddleware::class);
    }
}
