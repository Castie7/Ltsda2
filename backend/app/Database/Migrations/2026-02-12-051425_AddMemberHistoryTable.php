<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddMemberHistoryTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'member_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'changed_by' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
            ],
            'changes' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'note' => [
                'type'       => 'VARCHAR',
                'constraint' => 500,
                'null'       => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
            ],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('member_id');
        $this->forge->createTable('member_history');
    }

    public function down()
    {
        $this->forge->dropTable('member_history');
    }
}
