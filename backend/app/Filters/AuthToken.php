<?php
namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use App\Models\UserModel;

class AuthToken implements FilterInterface {
    
    public function before(RequestInterface $request, $arguments = null) {
        $authHeader = $request->getHeaderLine('Authorization');
        $token = null;

        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
        }

        // Fallback: check query parameter (for browser-navigated endpoints like backup download)
        if (!$token) {
            $token = $request->getGet('token');
        }

        if (!$token) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON([
                    'status'   => 'error',
                    'messages' => ['error' => 'Authentication required. Please log in.'],
                ]);
        }

        $userModel = new UserModel();
        $user = $userModel->where('session_token', $token)->first();

        if (!$user) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON([
                    'status'   => 'error',
                    'messages' => ['error' => 'Invalid or expired session. Please log in again.'],
                ]);
        }

        // Attach user info to the request for downstream controllers
        $request->authenticated_user = $user;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {
        // nothing needed
    }
}
