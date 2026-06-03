<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Airtel Money',
                'slug' => 'airtel-money',
                'type' => 'mobile_money',
                'description' => 'Mobile Money Airtel',
                'badge' => 'NOUVEAU',
                'icon' => 'mobile-alt',
                'color' => '#ef4444',
                'is_active' => true,
                'sort_order' => 0,
                'fields' => [
                    ['label' => 'Numéro Airtel Money', 'value' => '+261 33 59 493 64', 'copy_value' => '+261335949364', 'sort_order' => 0],
                    ['label' => 'Nom', 'value' => 'HARINJAKA', 'copy_value' => 'HARINJAKA', 'sort_order' => 1],
                ],
            ],
            [
                'name' => 'MVola',
                'slug' => 'mvola',
                'type' => 'mobile_money',
                'description' => 'Mobile Money Yas',
                'badge' => 'POPULAIRE',
                'icon' => 'mobile-alt',
                'color' => '#f97316',
                'is_active' => true,
                'sort_order' => 1,
                'fields' => [
                    ['label' => 'Numéro MVola', 'value' => '+261 38 17 181 89', 'copy_value' => '+261381718189', 'sort_order' => 0],
                    ['label' => 'Nom', 'value' => 'HARINJAKA', 'copy_value' => 'HARINJAKA', 'sort_order' => 1],
                ],
            ],
            [
                'name' => 'Orange Money',
                'slug' => 'orange-money',
                'type' => 'mobile_money',
                'description' => 'Mobile Money Orange',
                'badge' => 'FIABLE',
                'icon' => 'mobile-alt',
                'color' => '#ea580c',
                'is_active' => true,
                'sort_order' => 2,
                'fields' => [
                    ['label' => 'Numéro Orange Money', 'value' => '+261 37 66 242 70', 'copy_value' => '+261376624270', 'sort_order' => 0],
                    ['label' => 'Nom', 'value' => 'HARINJAKA', 'copy_value' => 'HARINJAKA', 'sort_order' => 1],
                ],
            ],
            [
                'name' => 'BRED Madagasikara',
                'slug' => 'bred-madagasikara',
                'type' => 'bank_transfer',
                'description' => 'Virement bancaire',
                'badge' => 'PRINCIPAL',
                'icon' => 'university',
                'color' => '#3b82f6',
                'is_active' => true,
                'sort_order' => 3,
                'fields' => [
                    ['label' => 'Titulaire', 'value' => 'ANDRIANANJA HARINJAKA', 'copy_value' => 'ANDRIANANJA HARINJAKA', 'sort_order' => 0],
                    ['label' => 'Domiciliation', 'value' => 'DIGUE - BRED', 'copy_value' => 'DIGUE - BRED', 'sort_order' => 1],
                    ['label' => 'Code banque', 'value' => '00008', 'copy_value' => '00008', 'sort_order' => 2],
                    ['label' => 'Code guichet', 'value' => '00014', 'copy_value' => '00014', 'sort_order' => 3],
                    ['label' => 'N° compte', 'value' => '05001528033', 'copy_value' => '05001528033', 'sort_order' => 4],
                    ['label' => 'Clé RIB', 'value' => '47', 'copy_value' => '47', 'sort_order' => 5],
                    ['label' => 'IBAN', 'value' => 'MG46 00008 00014 05001528033 47', 'copy_value' => 'MG46 00008 00014 05001528033 47', 'sort_order' => 6],
                    ['label' => 'BIC / SWIFT', 'value' => 'BFAVMGMG', 'copy_value' => 'BFAVMGMG', 'sort_order' => 7],
                ],
            ],
        ];

        foreach ($methods as $data) {
            $fields = $data['fields'];
            unset($data['fields']);

            $method = PaymentMethod::updateOrCreate(['slug' => $data['slug']], $data);

            // Reset fields so re-seeding stays idempotent.
            $method->fields()->delete();
            $method->fields()->createMany($fields);
        }
    }
}
