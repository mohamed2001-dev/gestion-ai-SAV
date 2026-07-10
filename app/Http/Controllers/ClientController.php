<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index()
    {
        return Client::latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'company_name' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
        ]);

        $client = Client::create($request->all());

        return response()->json([
            'message' => 'Client created successfully.',
            'client' => $client,
        ], 201);
    }

    public function show(Client $client)
    {
        return $client->load('equipments', 'savRequests');
    }

    public function update(Request $request, Client $client)
    {
        $request->validate([
            'company_name' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
        ]);

        $client->update($request->all());

        return response()->json([
            'message' => 'Client updated successfully.',
            'client' => $client,
        ]);
    }

    public function destroy(Client $client)
    {
        $client->delete();

        return response()->json([
            'message' => 'Client deleted successfully.',
        ]);
    }
}
