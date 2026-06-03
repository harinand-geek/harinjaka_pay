<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    protected $fillable = [
        'session_id',
        'ip_hash',
        'user_agent',
        'device_type',
        'browser',
        'platform',
        'country',
        'region',
        'city',
        'referrer',
        'visited_at',
    ];

    protected function casts(): array
    {
        return [
            'visited_at' => 'datetime',
        ];
    }
}
