<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Xuxemon;
use App\Models\OwnedXuxemon;

class GiveDailyXuxemons extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'xuxemons:daily';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Donar un xuxemon aleatori diari a cada usuari actiu';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::where('status', 1)->get();
        $xuxemons = Xuxemon::all();

        if ($xuxemons->isEmpty()) {
            $this->error('No hi ha xuxemons al catàleg.');
            return;
        }

        foreach ($users as $user) {
            $xuxemon = $xuxemons->random();

            OwnedXuxemon::create([
                'user_id' => $user->id,
                'xuxemon_id' => $xuxemon->id,
                'number_xuxes' => 0,
                'size' => $xuxemon->size,
            ]);

            Notification::create([
                'user_id' => $user->id,
                'title' => 'Xuxemon diària',
                'message' => "Has rebut un xuxemon diari: {$xuxemon->name} ({$xuxemon->type})."
            ]);

            $this->info("Usuari {$user->id} - Xuxemon donat: {$xuxemon->name} ({$xuxemon->type})");
        }

        $this->info('Xuxemons afegits a tots els usuaris correctament.');
    }
}

