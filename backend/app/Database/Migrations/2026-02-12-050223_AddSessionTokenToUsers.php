<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddSessionTokenToUsers extends Migration
{
    public function up()
    {
        $this->forge->addColumn('users', [
            'session_token' => [
                'type'       => 'VARCHAR',
                'constraint' => 128,
                'null'       => true,
                'after'      => 'role',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('users', 'session_token');
    }
}
