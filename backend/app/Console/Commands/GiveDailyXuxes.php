<?php

namespace App\Console\Commands;

use App\Models\Inventory;
use App\Models\Item;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Console\Command;

class GiveDailyXuxes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'xuxes:daily';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dar xuxes diarias a todos los jugadores';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $quantity = (int) Setting::where('key', 'daily_xuxes_quantity')->value('value');

        $users = User::where('status', 1)->with('inventory.item')->get();
        $xuxes = Item::where('stackable', true)->get();

        foreach ($users as $user) {
            $given = 0;

            for ($i = 0; $i < $quantity; $i++) {
                $item = $xuxes->random();

                $slot = Inventory::where('user_id', $user->id)
                    ->where('item_id', $item->id)
                    ->where('quantity', '<', $item->max_capacity)
                    ->first();

                if (!$slot) {
                    $usedSlots = Inventory::where('user_id', $user->id)->count();
                    if ($usedSlots >= 20) {
                        continue;
                    }

                    $slot = Inventory::create([
                        'user_id' => $user->id,
                        'item_id' => $item->id,
                        'quantity' => 0,
                    ]);
                }

                $slot->quantity += 1;
                $slot->save();
                $given++;
            }

            $this->info("Usuari {$user->id} - Xuxes donades: {$given}");
        }

        $this->info('Xuxes afegides a tots els usuaris correctament');
    }
}
