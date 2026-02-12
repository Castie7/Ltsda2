<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class ChangeBaptismDateToVarchar extends Migration
{
    public function up()
    {
        // Change baptism_date and rebaptism_date to VARCHAR to support Year-Only inputs
        $this->forge->modifyColumn('members', [
            'baptism_date' => [
                'type' => 'VARCHAR',
                'constraint' => '50',
                'null' => true,
            ],
            'rebaptism_date' => [
                'type' => 'VARCHAR',
                'constraint' => '50',
                'null' => true,
            ],
        ]);
    }

    public function down()
    {
        // Revert back to DATE (This might fail if data is not DATE format, but that's expected for rollback)
        $this->forge->modifyColumn('members', [
            'baptism_date' => [
                'type' => 'DATE',
                'null' => true,
            ],
            'rebaptism_date' => [
                'type' => 'DATE',
                'null' => true,
            ],
        ]);
    }
}
