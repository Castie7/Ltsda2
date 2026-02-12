<?php
namespace App\Models;
use CodeIgniter\Model;

class ActivityLogModel extends Model {
    protected $table = 'activity_logs';
    protected $primaryKey = 'id';
    protected $allowedFields = ['user_id', 'user_name', 'action', 'details', 'ip_address', 'created_at'];

    // Helper to log activity
    public function log($userId, $userName, $action, $details = null) {
        $this->insert([
            'user_id' => $userId,
            'user_name' => $userName,
            'action' => $action,
            'details' => $details,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }
}
