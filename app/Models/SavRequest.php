<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavRequest extends Model
{
        protected $fillable = [
        'client_id',
        'equipment_id',
        'title',
        'description',
        'priority',
        'status',
        'ai_category',
        'ai_suggested_solution',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function intervention()
    {
        return $this->hasOne(Intervention::class);
    }
}
