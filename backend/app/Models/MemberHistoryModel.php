<?php
namespace App\Models;
use CodeIgniter\Model;

class MemberHistoryModel extends Model {
    protected $table = 'member_history';
    protected $primaryKey = 'id';
    protected $allowedFields = ['member_id', 'changed_by', 'changes', 'note', 'created_at'];

    /**
     * Log a change for a member.
     * $changes is an array of ['field' => ['old' => ..., 'new' => ...]]
     */
    public function logChange(int $memberId, string $changedBy, array $changes, ?string $note = null): void {
        $this->insert([
            'member_id'  => $memberId,
            'changed_by' => $changedBy,
            'changes'    => json_encode($changes),
            'note'       => $note,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Get history for a specific member, newest first.
     */
    public function getHistory(int $memberId, int $limit = 20): array {
        return $this->where('member_id', $memberId)
                    ->orderBy('created_at', 'DESC')
                    ->limit($limit)
                    ->findAll();
    }
}
