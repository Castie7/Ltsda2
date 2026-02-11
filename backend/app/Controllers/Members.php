<?php
namespace App\Controllers;

use App\Models\MemberModel;
use CodeIgniter\RESTful\ResourceController;

class Members extends ResourceController {
    
    // FETCH ALL MEMBERS
    public function index() {
        $model = new MemberModel();
        $data = $model->findAll();
        return $this->respond($data);
    }

    // CREATE NEW MEMBER
    public function create() {
        $model = new MemberModel();
        $data = $this->request->getPost(); 

        // Handle Image Upload - FIXED field name to match update/frontend
        $img = $this->request->getFile('profile_pic_file');
        if ($img && $img->isValid() && !$img->hasMoved()) {
            $newName = $img->getRandomName();
            $img->move(FCPATH . 'uploads/profile_pics', $newName);
            $data['profile_pic'] = $newName;
        }

        // CLEANUP: Prevent MySQL crash on empty dates
        $dateFields = ['birth_date', 'baptism_date', 'rebaptism_date', 'date_received', 'exclusion_date'];
        foreach ($dateFields as $field) {
            if (isset($data[$field]) && empty($data[$field])) {
                $data[$field] = null;
            }
        }

        if ($model->insert($data)) {
            return $this->respondCreated(['status' => 'success', 'message' => 'Member created']);
        } else {
            // Return 400 Bad Request with Validation Errors
            return $this->fail($model->errors(), 400); 
        }
    }

    // FETCH SINGLE MEMBER
    public function show($id = null) {
        $model = new MemberModel();
        $data = $model->find($id);
        
        if ($data) {
            return $this->respond($data);
        } else {
            return $this->failNotFound('Member not found');
        }
    }

    // UPDATE MEMBER
    public function update($id = null)
    {
        $model = new MemberModel();

        if (!$model->find($id)) {
            return $this->failNotFound('Member not found');
        }

        $data = $this->request->getPost();

        // Handle Image Upload
        $img = $this->request->getFile('profile_pic_file');
        if ($img && $img->isValid() && !$img->hasMoved()) {
            $newName = $img->getRandomName();
            $img->move(FCPATH . 'uploads/profile_pics', $newName);
            $data['profile_pic'] = $newName; 
        }

        // CLEANUP: Prevent MySQL crash on empty dates
        $dateFields = ['birth_date', 'baptism_date', 'rebaptism_date', 'date_received', 'exclusion_date'];
        foreach ($dateFields as $field) {
            if (isset($data[$field]) && empty($data[$field])) {
                $data[$field] = null;
            }
        }

        if ($model->update($id, $data)) {
            return $this->respond(['status' => 'success', 'message' => 'Member updated successfully']);
        } else {
            return $this->fail($model->errors(), 400);
        }
    }
}