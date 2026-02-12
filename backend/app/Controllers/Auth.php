<?php
namespace App\Controllers;
use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;

class Auth extends ResourceController {
    public function login() {
        $userModel = new UserModel();
        $json = $this->request->getJSON(); // Get JSON data from Vue

        $user = $userModel->where('username', $json->username)->first();

        if (!$user) {
             return $this->failUnauthorized('Invalid login credentials');
        }

        $isValid = false;

        // 1. Check Legacy Plain Text (for existing users)
        if ($json->password === $user['password']) {
            $isValid = true;
            
            // Auto-migrate to secure hash
            // The UserModel's beforeUpdate callback will handle the hashing
            $userModel->update($user['id'], [
                'password' => $json->password
            ]);
            
            // Log Migration
            log_message('info', "Migrated password for user: {$user['username']}");
        } 
        // 2. Check Standard Hash (for new/migrated users)
        else if (password_verify($json->password, $user['password'])) {
            $isValid = true;
        }

        if ($isValid) {
            // Log Login
            $logModel = new \App\Models\ActivityLogModel();
            $logModel->log($user['id'], $user['full_name'], 'Login', 'User logged in successfully');

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
        
        // Log Failed Attempt
        return $this->failUnauthorized('Invalid login credentials');
    }

    public function logout() {
        // Since it's JWT/Tokenless or client-side storage, server doesn't "do" much for logout usually unless blacklist
        // But we can log the request if frontend calls this
        $json = $this->request->getJSON();
        if ($json && isset($json->user_id)) {
            $userModel = new UserModel();
            $user = $userModel->find($json->user_id);
            if ($user) {
                $logModel = new \App\Models\ActivityLogModel();
                $logModel->log($user['id'], $user['full_name'], 'Logout', 'User logged out');
            }
        }
        return $this->respond(['status' => 'success']);
    }
}