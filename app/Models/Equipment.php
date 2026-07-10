<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
        protected $fillable = [
        'client_id',
        'type',
        'brand',
        'model',
        'serial_number',
        'installation_date',
        'status',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function savRequests()
    {
        return $this->hasMany(SavRequest::class);
    }
}
