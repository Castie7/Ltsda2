<?php
namespace App\Controllers;
use App\Models\UserModel;
use App\Models\LoginAttemptModel;
use CodeIgniter\RESTful\ResourceController;

class Auth extends ResourceController {
    public function login() {
        $userModel = new UserModel();
        $attemptModel = new LoginAttemptModel();
        $json = $this->request->getJSON();

        $ip = $this->request->getIPAddress();
        $username = $json->username ?? '';

        // ── CHECK LOCKOUT ──
        $lockout = $attemptModel->getLockoutInfo($ip, $username);
        if ($lockout['locked']) {
            return $this->respond([
                'status'      => 'locked',
                'messages'    => ['error' => 'Too many failed attempts. Please wait before trying again.'],
                'retry_after' => $lockout['retry_after'],
                'attempts'    => $lockout['attempts'],
            ], 429);
        }

        $user = $userModel->where('username', $username)->first();

        if (!$user) {
            $attemptModel->recordAttempt($ip, $username);
            $lockout = $attemptModel->getLockoutInfo($ip, $username);
            return $this->respond([
                'status'      => 'error',
                'messages'    => ['error' => 'Invalid login credentials'],
                'attempts'    => $lockout['attempts'],
                'retry_after' => $lockout['retry_after'],
            ], 401);
        }

        $isValid = false;

        // 1. Check Legacy Plain Text (for existing users)
        if ($json->password === $user['password']) {
            $isValid = true;
            
            // Auto-migrate to secure hash
            $userModel->update($user['id'], [
                'password' => $json->password
            ]);
            
            log_message('info', "Migrated password for user: {$user['username']}");
        } 
        // 2. Check Standard Hash (for new/migrated users)
        else if (password_verify($json->password, $user['password'])) {
            $isValid = true;
        }

        if ($isValid) {
            // ── CLEAR ATTEMPTS ON SUCCESS ──
            $attemptModel->clearAttempts($ip, $username);

            // ── GENERATE SESSION TOKEN ──
            $token = bin2hex(random_bytes(32));
            $userModel->update($user['id'], ['session_token' => $token]);

            // Log Login
            $logModel = new \App\Models\ActivityLogModel();
            $logModel->log($user['id'], $user['full_name'], 'Login', 'User logged in successfully');

            return $this->respond([
                'status' => 'success',
                'token'  => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['full_name'],
                    'role' => $user['role'],
                    'profile_pic' => $user['profile_pic'] ?? null
                ]
            ], 200);
        }
        
        // ── RECORD FAILED ATTEMPT ──
        $attemptModel->recordAttempt($ip, $username);
        $lockout = $attemptModel->getLockoutInfo($ip, $username);

        // Log Failed Attempt
        $logModel = new \App\Models\ActivityLogModel();
        $logModel->log(0, $username, 'Failed Login', "Failed login attempt from IP: {$ip}");

        return $this->respond([
            'status'      => 'error',
            'messages'    => ['error' => 'Invalid login credentials'],
            'attempts'    => $lockout['attempts'],
            'retry_after' => $lockout['retry_after'],
        ], 401);
    }

    public function logout() {
        $json = $this->request->getJSON();
        if ($json && isset($json->user_id)) {
            $userModel = new UserModel();
            $user = $userModel->find($json->user_id);
            if ($user) {
                // ── CLEAR SESSION TOKEN ──
                $userModel->update($user['id'], ['session_token' => null]);

                $logModel = new \App\Models\ActivityLogModel();
                $logModel->log($user['id'], $user['full_name'], 'Logout', 'User logged out');
            }
        }
        return $this->respond(['status' => 'success']);
    }
}