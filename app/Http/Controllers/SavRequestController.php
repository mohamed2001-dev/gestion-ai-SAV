<?php

namespace App\Http\Controllers;

use App\Models\SavRequest;
use Illuminate\Http\Request;

class SavRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = SavRequest::with(['client', 'equipment', 'intervention.technician'])->latest();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        return response()->json([
            'sav_requests' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'equipment_id' => 'nullable|exists:equipments,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'nullable|in:new,assigned,in_progress,completed,cancelled',
            'ai_category' => 'nullable|string|max:255',
            'ai_suggested_solution' => 'nullable|string',
        ]);

        $validated['status'] = $validated['status'] ?? 'new';

        $savRequest = SavRequest::create($validated);

        return response()->json([
            'message' => 'SAV request created successfully.',
            'sav_request' => $savRequest->load(['client', 'equipment']),
        ], 201);
    }

    public function show(SavRequest $savRequest)
    {
        return response()->json([
            'sav_request' => $savRequest->load([
                'client',
                'equipment',
                'intervention.technician',
            ]),
        ]);
    }

    public function update(Request $request, SavRequest $savRequest)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'equipment_id' => 'nullable|exists:equipments,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:new,assigned,in_progress,completed,cancelled',
            'ai_category' => 'nullable|string|max:255',
            'ai_suggested_solution' => 'nullable|string',
        ]);

        $savRequest->update($validated);

        return response()->json([
            'message' => 'SAV request updated successfully.',
            'sav_request' => $savRequest->load(['client', 'equipment']),
        ]);
    }

    public function destroy(SavRequest $savRequest)
    {
        $savRequest->delete();

        return response()->json([
            'message' => 'SAV request deleted successfully.',
        ]);
    }
}
