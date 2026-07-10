<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\InterventionController;
use App\Http\Controllers\SavRequestController;
use App\Http\Controllers\TechnicianController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
     // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('clients', ClientController::class);
        Route::apiResource('equipments', EquipmentController::class);
        Route::apiResource('sav-requests', SavRequestController::class);
        Route::apiResource('interventions', InterventionController::class);

        Route::get('/technicians', [TechnicianController::class, 'index']);
        Route::post('/technicians', [TechnicianController::class, 'store']);
        Route::get('/technicians/{id}', [TechnicianController::class, 'show']);
        Route::put('/technicians/{id}', [TechnicianController::class, 'update']);
        Route::delete('/technicians/{id}', [TechnicianController::class, 'destroy']);
    });

    // Technician routes
    Route::middleware('role:technician')->group(function () {
        Route::get('/my-interventions', [InterventionController::class, 'myInterventions']);
        Route::get('/my-interventions/{id}', [InterventionController::class, 'myInterventionDetails']);
        Route::put('/my-interventions/{id}', [InterventionController::class, 'updateMyIntervention']);
    });
});
