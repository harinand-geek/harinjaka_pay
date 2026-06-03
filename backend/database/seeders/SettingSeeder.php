<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // Default premium dark abstract background. Replaceable from the admin.
            'background_image_url' => 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1920&q=80',
            // Dark overlay opacity (0 = image only, 1 = fully dark) for readability.
            'background_overlay' => '0.6',
        ];

        foreach ($defaults as $key => $value) {
            // Don't override a value an admin may have already customized.
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
