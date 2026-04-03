<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'player_id' => fake()->unique()->regexify('[A-Za-z]{4}#[0-9]{4}'),
            'name' => fake()->name(),
            'surname' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'role' => fake()->randomElement(['user', 'admin']),
            'pfp' => fake()->imageUrl(200, 200, 'people', true),
            'level' => fake()->numberBetween(0, 150),
            'xp' => fake()->numberBetween(0, 1000),
            'active' => fake()->boolean(50),
            'active_friends' => fake()->numberBetween(0, 10),
            'streak' => fake()->numberBetween(0, 50),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
