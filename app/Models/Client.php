<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'company_name',
        'name',
        'phone',
        'email',
        'city',
        'address',
    ];

    public function equipments()
    {
        return $this->hasMany(Equipment::class);
    }

    public function savRequests()
    {
        return $this->hasMany(SavRequest::class);
    }
}
