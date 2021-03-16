<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\User;
use App\Image;
use Illuminate\Support\Str;
use Faker\Generator as Faker;

$factory->define(Image::class, function (Faker $faker) {
    return [
        'user_id' => User::query()->firstOr(function () {
            return factory(User::class)->create();
        })->id,
        'name' => Str::random(10),
    ];
});
