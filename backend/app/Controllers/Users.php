<?php
namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;

class Users extends ResourceController {
    
    // FETCH SINGLE USER
    public function show($id = null) {
        $model = new UserModel();
        $data = $model->find($id);
        
        if ($data) {
            // Don't send password back in clear text if you can avoid it, 
            // but for editing "change password" we usually just verify old pw.
            // For now, let's just return what's needed.
            unset($data['password']); 
            return $this->respond($data);
        } else {
            return $this->failNotFound('User not found');
        }
    }

    // UPDATE USER
    public function update($id = null)
    {
        $model = new UserModel();
        $user = $model->find($id);

        if (!$user) {
            return $this->failNotFound('User not found');
        }

        $data = $this->request->getPost();

        // Handle Image Upload
        $img = $this->request->getFile('profile_pic_file');
        if ($img && $img->isValid() && !$img->hasMoved()) {
            $newName = $img->getRandomName();
            $img->move(FCPATH . 'uploads/profile_pics', $newName);
            
            // Delete old pic if exists and not default? (Optional enhancement)
            
            $data['profile_pic'] = $newName; 
        }

        // Handle Password Change
        // Only update password if a new one is provided.
        if (isset($data['new_password']) && !empty($data['new_password'])) {
            // In a real app, VERIFY OLD PASSWORD first.
            // And use PASSWORD_HASH. But consistent with Auth.php:
            $data['password'] = $data['new_password'];
        }
        
        // Remove helper fields
        unset($data['new_password']);
        unset($data['confirm_password']);

        if ($model->update($id, $data)) {
            // Fetch updated user to return
            $updatedUser = $model->find($id);
            unset($updatedUser['password']);
            
            return $this->respond([
                'status' => 'success', 
                'message' => 'Profile updated successfully',
                'user' => $updatedUser
            ]);
        } else {
            return $this->fail($model->errors(), 400);
        }
    }
}
