<?php

namespace App\Http\Controllers;

use App\Models\Intervention;
use App\Models\SavRequest;
use App\Models\User;
use Illuminate\Http\Request;

class InterventionController extends Controller
{
    public function index(Request $request)
    {
        $query = Intervention::with([
            'savRequest.client',
            'savRequest.equipment',
            'technician',
        ])->latest();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('technician_id')) {
            $query->where('technician_id', $request->technician_id);
        }

        return response()->json([
            'interventions' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sav_request_id' => 'required|exists:sav_requests,id',
            'technician_id' => 'required|exists:users,id',
            'intervention_date' => 'nullable|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'status' => 'nullable|in:assigned,in_progress,completed,cancelled',
        ]);

        $technician = User::where('id', $validated['technician_id'])
            ->where('role', 'technician')
            ->first();

        if (!$technician) {
            return response()->json([
                'message' => 'Selected user is not a technician.',
            ], 422);
        }

        $alreadyExists = Intervention::where('sav_request_id', $validated['sav_request_id'])->exists();

        if ($alreadyExists) {
            return response()->json([
                'message' => 'This SAV request already has an intervention.',
            ], 422);
        }

        $validated['status'] = $validated['status'] ?? 'assigned';

        $intervention = Intervention::create($validated);

        SavRequest::where('id', $validated['sav_request_id'])->update([
            'status' => 'assigned',
        ]);

        return response()->json([
            'message' => 'Intervention assigned successfully.',
            'intervention' => $intervention->load([
                'savRequest.client',
                'savRequest.equipment',
                'technician',
            ]),
        ], 201);
    }

    public function show(Intervention $intervention)
    {
        return response()->json([
            'intervention' => $intervention->load([
                'savRequest.client',
                'savRequest.equipment',
                'technician',
            ]),
        ]);
    }

    public function update(Request $request, Intervention $intervention)
    {
        $validated = $request->validate([
            'technician_id' => 'required|exists:users,id',
            'intervention_date' => 'nullable|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'diagnosis' => 'nullable|string',
            'work_done' => 'nullable|string',
            'parts_used' => 'nullable|string',
            'technician_notes' => 'nullable|string',
            'ai_generated_report' => 'nullable|string',
            'final_report' => 'nullable|string',
            'status' => 'required|in:assigned,in_progress,completed,cancelled',
        ]);

        $technician = User::where('id', $validated['technician_id'])
            ->where('role', 'technician')
            ->first();

        if (!$technician) {
            return response()->json([
                'message' => 'Selected user is not a technician.',
            ], 422);
        }

        $intervention->update($validated);

        $this->syncSavRequestStatus($intervention);

        return response()->json([
            'message' => 'Intervention updated successfully.',
            'intervention' => $intervention->load([
                'savRequest.client',
                'savRequest.equipment',
                'technician',
            ]),
        ]);
    }

    public function destroy(Intervention $intervention)
    {
        $savRequest = $intervention->savRequest;

        $intervention->delete();

        if ($savRequest) {
            $savRequest->update([
                'status' => 'new',
            ]);
        }

        return response()->json([
            'message' => 'Intervention deleted successfully.',
        ]);
    }

    public function myInterventions(Request $request)
    {
        $interventions = Intervention::with([
            'savRequest.client',
            'savRequest.equipment',
            'technician',
        ])
            ->where('technician_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'interventions' => $interventions,
        ]);
    }

    public function myInterventionDetails(Request $request, $id)
    {
        $intervention = Intervention::with([
            'savRequest.client',
            'savRequest.equipment',
            'technician',
        ])
            ->where('id', $id)
            ->where('technician_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'intervention' => $intervention,
        ]);
    }

    public function updateMyIntervention(Request $request, $id)
    {
        $intervention = Intervention::where('id', $id)
            ->where('technician_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'intervention_date' => 'nullable|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'diagnosis' => 'nullable|string',
            'work_done' => 'nullable|string',
            'parts_used' => 'nullable|string',
            'technician_notes' => 'nullable|string',
            'ai_generated_report' => 'nullable|string',
            'final_report' => 'nullable|string',
            'status' => 'required|in:assigned,in_progress,completed,cancelled',
        ]);

        $intervention->update($validated);

        $this->syncSavRequestStatus($intervention);

        return response()->json([
            'message' => 'Your intervention was updated successfully.',
            'intervention' => $intervention->load([
                'savRequest.client',
                'savRequest.equipment',
                'technician',
            ]),
        ]);
    }

    private function syncSavRequestStatus(Intervention $intervention): void
    {
        if (!$intervention->savRequest) {
            return;
        }

        if ($intervention->status === 'completed') {
            $intervention->savRequest->update([
                'status' => 'completed',
            ]);
        } elseif ($intervention->status === 'in_progress') {
            $intervention->savRequest->update([
                'status' => 'in_progress',
            ]);
        } elseif ($intervention->status === 'cancelled') {
            $intervention->savRequest->update([
                'status' => 'cancelled',
            ]);
        } else {
            $intervention->savRequest->update([
                'status' => 'assigned',
            ]);
        }
    }
}
