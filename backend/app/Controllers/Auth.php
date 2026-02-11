<?php
namespace App\Controllers;
use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;

class Auth extends ResourceController {
    public function login() {
        $userModel = new UserModel();
        $json = $this->request->getJSON(); // Get JSON data from Vue

        $user = $userModel->where('username', $json->username)->first();

        // Simple check (Use password_verify in production for hashed passwords)
        if ($user && $json->password === $user['password']) {
            return $this->respond([
                'status' => 'success',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['full_name'],
                    'role' => $user['role'],
                    'profile_pic' => $user['profile_pic'] ?? null
                ]
            ], 200);
        }

        return $this->failUnauthorized('Invalid login credentials');
    }
}