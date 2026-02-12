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
            // Log Activity
            $logModel = new \App\Models\ActivityLogModel();
            // Assuming we can get the current user ID - for now using a placeholder or parameter
            // In a real stateless API, we'd extract from JWT. 
            // Here, we'll assume the frontend sends 'current_user_id' or we just say "System/User"
            $userId = $this->request->getVar('current_user_id') ?? null;
            $userName = $this->request->getVar('current_user_name') ?? 'Unknown User';
            
            $logModel->log($userId, $userName, 'Create Member', "Created member: " . $data['full_name']);

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

        $oldData = $model->find($id);
        if (!$oldData) {
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

        // Fix for is_unique validation with placeholder {id}
        $rules = $model->getValidationRules();
        if (isset($rules['full_name'])) {
             if (is_array($rules['full_name'])) {
                 $rules['full_name']['rules'] = str_replace('{id}', $id, $rules['full_name']['rules']);
             } else {
                 $rules['full_name'] = str_replace('{id}', $id, $rules['full_name']);
             }
             $model->setValidationRules($rules);
        }

        if ($model->update($id, $data)) {
            // ── TRACK CHANGES ──
            $changes = [];
            $skipFields = ['current_user_id', 'current_user_name', 'profile_pic_file', 'updated_at', 'created_at', 'deleted_at', 'id'];
            
            foreach ($data as $field => $newValue) {
                if (in_array($field, $skipFields)) continue;
                $oldValue = $oldData[$field] ?? '';
                $newValue = $newValue ?? '';
                
                if ((string)$oldValue !== (string)$newValue) {
                    $changes[$field] = [
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
            }

            if (!empty($changes)) {
                $historyModel = new \App\Models\MemberHistoryModel();
                $userName = $this->request->getVar('current_user_name') ?? 'Unknown User';
                
                // Build a readable summary
                $changedFields = array_keys($changes);
                $note = 'Updated: ' . implode(', ', $changedFields);
                
                $historyModel->logChange((int)$id, $userName, $changes, $note);
            }

            return $this->respond(['status' => 'success', 'message' => 'Member updated successfully']);
        } else {
            return $this->fail($model->errors(), 400);
        }
    }

    // GET MEMBER CHANGE HISTORY
    public function history($id = null) {
        $historyModel = new \App\Models\MemberHistoryModel();
        $history = $historyModel->getHistory((int)$id);
        return $this->respond($history);
    }

    // IMPORT MEMBERS FROM CSV
    public function import() 
    {
        $file = $this->request->getFile('csv_file');

        if (!$file || !$file->isValid()) {
            return $this->fail('Invalid file uploaded', 400);
        }

        if ($file->getExtension() !== 'csv') {
            return $this->fail('File must be a CSV', 400);
        }

        $filePath = $file->getTempName();
        $csvData = array_map('str_getcsv', file($filePath));
        
        $header = array_shift($csvData); // Remove header row
        
        // Remove BOM if present from the first key
        if (isset($header[0])) {
            $header[0] = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $header[0]);
        }

        $count = 0;
        $errors = [];
        $model = new MemberModel();

        foreach ($csvData as $index => $row) {
            if (count($row) !== count($header)) {
                continue; // Skip malformed rows
            }

            $rowData = array_combine($header, $row);

            // Manual Mapping: CSV Header -> DB Column
            // Assumes CSV headers match your downloadTemplate keys exactly
            $dbData = [
                'member_code'     => $rowData['member_code'] ?? '',
                'status'          => $rowData['status'] ?? 'Active',
                // Construct full name if separate parts exist
                'full_name'       => trim(($rowData['last_name'] ?? '') . ', ' . ($rowData['first_name'] ?? '') . ' ' . ($rowData['middle_name'] ?? '')),
                'gender'          => $rowData['gender'] ?? '',
                'civil_status'    => $rowData['civil_status'] ?? '',
                'birth_date'      => $this->parseDate($rowData['birth_date'] ?? ''),
                'birthplace'      => $rowData['birthplace'] ?? '',
                'address_street'  => $rowData['address_street'] ?? '',
                'barangay'        => $rowData['barangay'] ?? '',
                'town_city'       => $rowData['town_city'] ?? '',
                'province'        => $rowData['province'] ?? '',
                'zip_code'        => $rowData['zip_code'] ?? '',
                'phone_no'        => $rowData['phone_no'] ?? '',
                'email'           => $rowData['email'] ?? '',
                'educational_level' => $rowData['educational_level'] ?? '',
                'occupation'      => $rowData['occupation'] ?? '',
                'former_religion' => $rowData['former_religion'] ?? '',
                'hobbies_gifts'   => $rowData['hobbies_gifts'] ?? '',
                'baptism_date'    => $this->parseDate($rowData['baptism_date'] ?? ''),
                'officiating_minister' => $rowData['officiating_minister'] ?? '',
                'place_of_baptism' => $rowData['place_of_baptism'] ?? '',
                'rebaptism_date'  => $this->parseDate($rowData['rebaptism_date'] ?? ''),
                'rebaptism_minister' => $rowData['rebaptism_minister'] ?? '',
                'rebaptism_place' => $rowData['rebaptism_place'] ?? '',
                'received_by'     => $rowData['received_by'] ?? '',
                'date_received'   => $this->parseDate($rowData['date_received'] ?? ''),
                'from_church'     => $rowData['from_church'] ?? '',
                'observation'     => $rowData['observation'] ?? '',
            ];

            // Basic Validation before Insert
            if (empty($dbData['full_name']) || $dbData['full_name'] === ',  ') {
                continue; // Skip empty names
            }

            try {
                if ($model->insert($dbData)) {
                    $count++;
                } else {
                    $errors[] = "Row " . ($index + 2) . ": " . implode(', ', $model->errors());
                }
            } catch (\Exception $e) {
                $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
            }
        }

        // Log Activity
        $logModel = new \App\Models\ActivityLogModel();
        
        // Debug logging
        log_message('error', 'Import Request Vars: ' . json_encode($this->request->getVar()));
        
        $userId = $this->request->getVar('current_user_id') ?? null;
        $userName = $this->request->getVar('current_user_name') ?? 'Unknown User';
        
        $logModel->log($userId, $userName, 'Import Members', "Imported $count members from CSV");

        return $this->respond([
            'status' => 'success',
            'message' => "Imported $count members successfully.",
            'errors' => $errors
        ]);
    }


    // DELETE MEMBER
    public function delete($id = null) {
        $model = new MemberModel();
        
        // Fetch member name for logging before deletion
        $member = $model->find($id);
        if (!$member) {
            return $this->failNotFound('Member not found');
        }

        if ($model->delete($id)) {
            // Log Activity
            $logModel = new \App\Models\ActivityLogModel();
            // Assuming current user ID is passed or available (similar to create/import)
            $userId = $this->request->getVar('current_user_id') ?? null;
            $userName = $this->request->getVar('current_user_name') ?? 'System/Admin';
            
            $logModel->log($userId, $userName, 'Delete Member', "Deleted member: " . $member['full_name']);

            return $this->respondDeleted(['status' => 'success', 'message' => 'Member deleted successfully']);
        } else {
            return $this->fail($model->errors(), 400);
        }
    }

    // Helper to parse various date formats to Y-m-d
    private function parseDate($dateString) 
    {
        if (empty($dateString)) return null;
        
        // Clean up string
        $dateString = trim($dateString);
        
        // Try strtotime
        $timestamp = strtotime($dateString);
        if ($timestamp !== false) {
            return date('Y-m-d', $timestamp);
        }
        
        return null; // Return null if unparsable
    }
}