<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Equipment::with('client')->latest();

        if ($request->has('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        return response()->json([
            'equipments' => $query->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'type' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'installation_date' => 'nullable|date',
            'status' => 'nullable|string|max:100',
        ]);

        $equipment = Equipment::create($validated);

        return response()->json([
            'message' => 'Equipment created successfully.',
            'equipment' => $equipment->load('client'),
        ], 201);
    }

    public function show(Equipment $equipment)
    {
        return response()->json([
            'equipment' => $equipment->load('client', 'savRequests'),
        ]);
    }

    public function update(Request $request, Equipment $equipment)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'type' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'installation_date' => 'nullable|date',
            'status' => 'nullable|string|max:100',
        ]);

        $equipment->update($validated);

        return response()->json([
            'message' => 'Equipment updated successfully.',
            'equipment' => $equipment->load('client'),
        ]);
    }

    public function destroy(Equipment $equipment)
    {
        $equipment->delete();

        return response()->json([
            'message' => 'Equipment deleted successfully.',
        ]);
    }
}
