<?php
namespace App\Controllers;
use App\Models\UserModel;
use App\Models\ActivityLogModel;
use CodeIgniter\RESTful\ResourceController;

class Admin extends ResourceController {
    
    // FETCH ACTIVITY LOGS
    public function logs() {
        $model = new ActivityLogModel();
        
        // Pagination params
        $page = $this->request->getVar('page') ?? 1;
        $perPage = $this->request->getVar('perPage') ?? 20;
        
        // Optional filters
        $search = $this->request->getVar('search');

        if ($search) {
             $model->like('user_name', $search)
                   ->orLike('action', $search)
                   ->orLike('details', $search);
        }
        
        $data = $model->orderBy('created_at', 'DESC')->paginate($perPage, 'default', $page);
        
        return $this->respond([
            'data' => $data,
            'pager' => $model->pager,
            'total' => $model->pager->getTotal() // helper if available, or use countAllResults
        ]);
    }

    // CREATE USER (Admin only usually)
    public function createUser() {
        $model = new UserModel();
        $data = $this->request->getJSON(true); // Get as array

        if ($model->insert($data)) {
            // Log action
            // In real app, get current user ID from JWT/Session. 
            // For now assuming we pass admin_id in request or just log as "System/Admin"
            
            return $this->respondCreated(['status' => 'success', 'message' => 'User created']);
        } else {
            return $this->fail($model->errors(), 400);
        }
    }

    // LIST USERS
    public function users() {
        $model = new UserModel();
        $users = $model->findAll();
        // Remove passwords
        foreach ($users as &$u) {
            unset($u['password']);
        }
        return $this->respond($users);
    }
    
    // RESET PASSWORD
    public function resetPassword($id = null) {
        $model = new UserModel();
        $json = $this->request->getJSON();
        
        if (!$id || !isset($json->new_password)) {
            return $this->fail('Missing ID or password', 400);
        }
        
        $data = ['password' => $json->new_password];
        
        if ($model->update($id, $data)) {
            return $this->respond(['status' => 'success', 'message' => 'Password reset successfully']);
        } else {
            return $this->fail($model->errors(), 400);
        }
    }
    // DATABASE BACKUP (Export)
    public function backupDatabase() {
        $db = \Config\Database::connect();
        $tables = $db->listTables();
        $sql = "-- LTSDA Database Backup\n-- Date: " . date('Y-m-d H:i:s') . "\n\n";
        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $table) {
            // Get Create Table Structure
            $query = $db->query("SHOW CREATE TABLE `$table`");
            $row = $query->getRowArray();
            $sql .= "DROP TABLE IF EXISTS `$table`;\n";
            $sql .= $row['Create Table'] . ";\n\n";

            // Get Data
            $query = $db->query("SELECT * FROM `$table`");
            $rows = $query->getResultArray();

            foreach ($rows as $row) {
                $sql .= "INSERT INTO `$table` VALUES (";
                $values = [];
                foreach ($row as $value) {
                    if ($value === null) {
                        $values[] = "NULL";
                    } else {
                        $values[] = "'" . $db->escapeString($value) . "'";
                    }
                }
                $sql .= implode(", ", $values);
                $sql .= ");\n";
            }
            $sql .= "\n";
        }

        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

        $filename = 'LTSDA_' . date('Y-m-d') . '.sql';

        return $this->response->download($filename, $sql)->setFileName($filename);
    }

    // DATABASE RESTORE (Import)
    public function importDatabase() {
        $file = $this->request->getFile('sql_file');

        // Debug Logging
        if ($file) {
            log_message('error', 'Import SQL File Info: ' . json_encode([
                'isValid' => $file->isValid(),
                'extension' => $file->getExtension(),
                'clientExtension' => $file->getClientExtension(), // Trust the client extension for .sql usually
                'mime' => $file->getMimeType(),
                'name' => $file->getName(),
                'error' => $file->getErrorString() . ' (' . $file->getError() . ')'
            ]));
        } else {
            log_message('error', 'Import SQL File: No file received.');
        }

        // Loosen check slightly: Check client extension if getExtension fail, or just rely on isValid for now and check manually
        if (!$file || !$file->isValid()) {
             return $this->fail('Invalid file upload: ' . ($file ? $file->getErrorString() : 'No file'), 400);
        }

        // mime types for sql can be text/plain, application/sql, etc. 
        // extensions can be sql
        $ext = $file->getClientExtension();
        if ($ext !== 'sql') {
            return $this->fail('Invalid file extension: ' . $ext . '. Must be .sql', 400);
        }

        $sql = file_get_contents($file->getTempName());
        $db = \Config\Database::connect();

        // Split into individual queries (basic split by ;)
        // Note: This is a simple implementation. Complex SQL with ; in strings might break this.
        // For a robust solution, a proper SQL parser is needed, but this suffices for basic dumps.
        $queries = explode(';', $sql);

        $db->transStart();
        $db->query('SET FOREIGN_KEY_CHECKS=0');

        foreach ($queries as $query) {
            $query = trim($query);
            if (!empty($query)) {
                try {
                    $db->query($query);
                } catch (\Exception $e) {
                    // Log error but maybe continue? Or fail hard?
                    // For now, let's fail hard to ensure integrity
                    $db->transRollback();
                    return $this->fail('Error executing SQL: ' . $e->getMessage(), 500);
                }
            }
        }

        $db->query('SET FOREIGN_KEY_CHECKS=1');
        $db->transComplete();

        if ($db->transStatus() === false) {
            return $this->fail('Database restore failed.', 500);
        }

        // Log Activity
        $logModel = new \App\Models\ActivityLogModel();
        $userId = $this->request->getVar('current_user_id') ?? null;
        $userName = $this->request->getVar('current_user_name') ?? 'System/Admin';
        $logModel->log($userId, $userName, 'Database Restore', 'Restored database from uploded SQL file.');

        return $this->respond(['status' => 'success', 'message' => 'Database restored successfully.']);
    }
}
