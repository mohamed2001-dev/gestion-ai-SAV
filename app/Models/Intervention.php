<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Intervention extends Model
{
        protected $fillable = [
        'sav_request_id',
        'technician_id',
        'intervention_date',
        'start_time',
        'end_time',
        'diagnosis',
        'work_done',
        'parts_used',
        'technician_notes',
        'ai_generated_report',
        'final_report',
        'status',
    ];

    public function savRequest()
    {
        return $this->belongsTo(SavRequest::class);
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}
