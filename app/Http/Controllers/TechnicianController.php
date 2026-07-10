<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TechnicianController extends Controller
{
    public function index()
    {
        return User::where('role', 'technician')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
        ]);

        $technician = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'technician',
        ]);

        return response()->json([
            'message' => 'Technician created successfully.',
            'technician' => $technician,
        ], 201);
    }

    public function show($id)
    {
        return User::where('role', 'technician')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $technician = User::where('role', 'technician')->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $technician->id,
            'password' => 'nullable|min:6',
        ]);

        $technician->name = $request->name;
        $technician->email = $request->email;

        if ($request->password) {
            $technician->password = Hash::make($request->password);
        }

        $technician->save();

        return response()->json([
            'message' => 'Technician updated successfully.',
            'technician' => $technician,
        ]);
    }

    public function destroy($id)
    {
        $technician = User::where('role', 'technician')->findOrFail($id);
        $technician->delete();

        return response()->json([
            'message' => 'Technician deleted successfully.',
        ]);
    }
}
